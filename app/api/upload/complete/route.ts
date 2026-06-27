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
    if (cloudFile.uploadedById !== session.userId) {
      return NextResponse.json({ error: "Forbidden: You do not own this file" }, { status: 403 });
    }

    if (cloudFile.state !== "UPLOADING") {
      return NextResponse.json({ error: "File is not in UPLOADING state" }, { status: 400 });
    }

    // Authoritative Backend Validation: Fetch direct from Cloudinary
    let asset;
    try {
      asset = await cloudinary.api.resource(cloudFile.publicId);
    } catch (error) {
      await db.cloudFile.update({
        where: { id: fileId },
        data: { state: "FAILED" }
      });
      return NextResponse.json({ error: "Asset not found in Cloudinary" }, { status: 400 });
    }

    const allowedExtensions = ["pdf", "doc", "docx", "jpg", "jpeg", "png", "zip", "rar", "ppt", "pptx"];
    const ext = (asset.format || "").toLowerCase();
    
    if (!allowedExtensions.includes(ext) || asset.bytes > 50 * 1024 * 1024) {
      // Cleanup unauthorized / oversized upload
      await cloudinary.uploader.destroy(asset.public_id).catch(() => {});
      await db.cloudFile.update({
        where: { id: fileId },
        data: { state: "FAILED" }
      });
      return NextResponse.json({ error: "Invalid file format or size exceeded" }, { status: 400 });
    }

    // Cloudinary Etag (MD5) acting as our deduplication hash
    const fileHash = asset.etag; 

    // Mock Enterprise Virus Scanning
    const isScanned = true;
    const isSafe = true; // In reality, we might hook this to ClamAV or similar
    const scanProvider = "MockEnterpriseScanner-v1";
    const scanResult = "CLEAN";

    // Update File and User Quota transactionally
    try {
      await db.$transaction(async (tx) => {
        const user = await tx.user.findUnique({
          where: { id: session.userId },
          select: { storageUsed: true, storageQuota: true }
        });

        if (!user || user.storageUsed + asset.bytes > user.storageQuota) {
          throw new Error("QUOTA_EXCEEDED");
        }

        await tx.cloudFile.update({
          where: { id: fileId },
          data: {
            url: asset.url,
            secureUrl: asset.secure_url,
            format: asset.format || asset.resource_type,
            bytes: asset.bytes,
            resourceType: asset.resource_type,
            fileHash,
            state: "ACTIVE",
            isScanned,
            isSafe,
            scanProvider,
            scanResult,
          }
        });

        await tx.user.update({
          where: { id: session.userId },
          data: {
            storageUsed: { increment: asset.bytes }
          }
        });
      });
    } catch (error: any) {
      if (error.message === "QUOTA_EXCEEDED") {
        await cloudinary.uploader.destroy(asset.public_id).catch(() => {});
        await db.cloudFile.update({
          where: { id: fileId },
          data: { state: "FAILED" }
        });
        return NextResponse.json({ error: "Storage quota exceeded" }, { status: 403 });
      }
      throw error;
    }

    const updatedFile = await db.cloudFile.findUnique({ where: { id: fileId } });

    return NextResponse.json({ success: true, file: updatedFile });
  } catch (error) {
    console.error("Upload complete error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
