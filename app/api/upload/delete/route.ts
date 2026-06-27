import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { fileId } = await req.json();
    if (!fileId) {
      return NextResponse.json({ error: "Missing fileId" }, { status: 400 });
    }

    const cloudFile = await db.cloudFile.findUnique({
      where: { id: fileId }
    });

    if (!cloudFile) {
      return NextResponse.json({ error: "File not found" }, { status: 404 });
    }

    // Security Verification: Ownership check
    // Admins might need the ability to delete any file, but for now we strictly check owner
    const user = await db.user.findUnique({ where: { id: session.userId } });
    if (cloudFile.uploadedById !== session.userId && user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: You do not own this file" }, { status: 403 });
    }

    if (cloudFile.state === "DELETED") {
      return NextResponse.json({ error: "File is already deleted" }, { status: 400 });
    }

    // Soft delete locally and restore quota
    await db.$transaction(async (tx) => {
      await tx.cloudFile.update({
        where: { id: fileId },
        data: {
          state: "DELETED",
          deletedAt: new Date()
        }
      });

      if (cloudFile.state === "ACTIVE") {
        await tx.user.update({
          where: { id: cloudFile.uploadedById },
          data: {
            storageUsed: { decrement: cloudFile.bytes }
          }
        });
      }
    });

    // Fire and forget physical deletion from Cloudinary to reclaim actual storage space
    cloudinary.uploader.destroy(cloudFile.publicId).catch(err => {
      console.error(`Failed to delete asset ${cloudFile.publicId} from Cloudinary`, err);
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Upload delete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
