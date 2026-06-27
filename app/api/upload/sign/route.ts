import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { db } from "@/lib/db";
import cloudinary from "@/lib/cloudinary";
import crypto from "crypto";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { folder = "misc", originalName, bytes, format } = body;

    const allowedFolders = ["profiles", "assignments", "notices", "notes", "misc"];
    if (!allowedFolders.includes(folder)) {
      return NextResponse.json({ error: "Invalid folder" }, { status: 400 });
    }

    if (!bytes || bytes <= 0) {
      return NextResponse.json({ error: "Invalid file size" }, { status: 400 });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      select: { storageQuota: true, storageUsed: true }
    });

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (user.storageUsed + bytes > user.storageQuota) {
      return NextResponse.json({ error: "Storage quota exceeded" }, { status: 403 });
    }

    const uniqueId = crypto.randomUUID();
    const folderPath = `campusdex/${folder}`;
    const publicId = `${folderPath}/${uniqueId}`;

    const timestamp = Math.round(new Date().getTime() / 1000);
    
    const signature = cloudinary.utils.api_sign_request(
      {
        timestamp,
        folder: folderPath,
        public_id: uniqueId,
      },
      process.env.CLOUDINARY_API_SECRET!
    );

    const cloudFile = await db.cloudFile.create({
      data: {
        publicId,
        url: "",
        secureUrl: "",
        format: format || "unknown",
        bytes: bytes,
        originalName: originalName || "unknown",
        state: "UPLOADING",
        uploadedById: session.userId,
      }
    });

    return NextResponse.json({
      signature,
      timestamp,
      cloudName: process.env.CLOUDINARY_CLOUD_NAME,
      apiKey: process.env.CLOUDINARY_API_KEY,
      publicId,
      fileId: cloudFile.id,
      folder: folderPath,
      uniqueId
    });

  } catch (error) {
    console.error("Upload sign error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
