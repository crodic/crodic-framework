"use client";

import React, { useCallback, useRef, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Camera,
  Image as ImageIcon,
  Loader2,
  RotateCw,
  Trash2,
  UploadCloud,
  ZoomIn,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { extractErrorMessage, useUpdateAvatar } from "@/hooks/use-profile";

function getRadianAngle(degreeValue: number) {
  return (degreeValue * Math.PI) / 180;
}

function createImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new window.Image();
    image.addEventListener("load", () => resolve(image));
    image.addEventListener("error", (error) => reject(error));
    image.setAttribute("crossOrigin", "anonymous");
    image.src = url;
  });
}

function rotateSize(width: number, height: number, rotation: number) {
  const rotRad = getRadianAngle(rotation);
  return {
    width:
      Math.abs(Math.cos(rotRad) * width) + Math.abs(Math.sin(rotRad) * height),
    height:
      Math.abs(Math.sin(rotRad) * width) + Math.abs(Math.cos(rotRad) * height),
  };
}

async function getCroppedImageBlob(
  imageSrc: string,
  pixelCrop: Area,
  rotation = 0,
  mimeType = "image/jpeg"
): Promise<Blob> {
  const image = await createImage(imageSrc);
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas context not available");

  const rotRad = getRadianAngle(rotation);
  const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
    image.width,
    image.height,
    rotation
  );

  canvas.width = bBoxWidth;
  canvas.height = bBoxHeight;

  ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
  ctx.rotate(rotRad);
  ctx.drawImage(image, -image.width / 2, -image.height / 2);
  ctx.rotate(-rotRad);
  ctx.translate(-bBoxWidth / 2, -bBoxHeight / 2);

  const data = ctx.getImageData(
    pixelCrop.x,
    pixelCrop.y,
    pixelCrop.width,
    pixelCrop.height
  );

  const outputCanvas = document.createElement("canvas");
  outputCanvas.width = pixelCrop.width;
  outputCanvas.height = pixelCrop.height;

  const outCtx = outputCanvas.getContext("2d");
  if (!outCtx) throw new Error("Canvas context not available");
  outCtx.putImageData(data, 0, 0);

  return new Promise((resolve) => {
    outputCanvas.toBlob(
      (blob) => resolve(blob as Blob),
      mimeType,
      mimeType === "image/png" ? undefined : 0.92
    );
  });
}

interface AvatarCropDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  currentAvatarUrl?: string | null;
}

export function AvatarCropDialog({
  open,
  onOpenChange,
  currentAvatarUrl,
}: AvatarCropDialogProps) {
  const t = useTranslations("Profile.avatar");
  const updateAvatarMutation = useUpdateAvatar();

  const inputRef = useRef<HTMLInputElement | null>(null);
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [fileMimeType, setFileMimeType] = useState<string>("image/jpeg");
  const [isDragOver, setIsDragOver] = useState(false);

  const onCropComplete = useCallback(
    (_croppedArea: Area, croppedAreaPixels: Area) => {
      setCroppedAreaPixels(croppedAreaPixels);
    },
    []
  );

  const handleFileSelect = (file: File) => {
    if (!file || !file.type.startsWith("image/")) {
      toast.error(t("error"));
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error(t("dropHint"));
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setImageSrc(objectUrl);
    setFileMimeType(file.type || "image/jpeg");
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleRotate = () => {
    setRotation((prev) => (prev + 90) % 360);
  };

  const handleSave = async () => {
    if (!imageSrc || !croppedAreaPixels) return;

    try {
      const croppedBlob = await getCroppedImageBlob(
        imageSrc,
        croppedAreaPixels,
        rotation,
        fileMimeType
      );
      await updateAvatarMutation.mutateAsync({ file: croppedBlob });
      toast.success(t("success"));
      onOpenChange(false);
      resetState();
    } catch (error) {
      toast.error(extractErrorMessage(error, t("error")));
    }
  };

  const handleRemove = async () => {
    try {
      await updateAvatarMutation.mutateAsync({ removeAvatar: true });
      toast.success(t("removeSuccess"));
      onOpenChange(false);
      resetState();
    } catch (error) {
      toast.error(extractErrorMessage(error, t("error")));
    }
  };

  const resetState = () => {
    setImageSrc(null);
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setRotation(0);
    setCroppedAreaPixels(null);
    if (inputRef.current) inputRef.current.value = "";
  };

  const handleClose = () => {
    onOpenChange(false);
    resetState();
  };

  const isSaving = updateAvatarMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="border-border/60 rounded-2xl sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-lg font-semibold">
            <Camera className="text-primary size-5" />
            <span>{t("title")}</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            {t("description")}
          </DialogDescription>
        </DialogHeader>

        {/* Hidden file input */}
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp"
          onChange={handleInputChange}
          className="sr-only"
        />

        {!imageSrc ? (
          /* Dropzone */
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragOver(true);
            }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`border-border/80 hover:border-primary/50 hover:bg-primary/5 flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 text-center transition-all ${
              isDragOver ? "border-primary bg-primary/10" : "bg-background/50"
            }`}
          >
            <div className="bg-primary/10 text-primary flex size-12 items-center justify-center rounded-2xl">
              <UploadCloud className="size-6" />
            </div>
            <div className="space-y-1">
              <p className="text-foreground text-sm font-semibold">
                {t("dropOrClick")}
              </p>
              <p className="text-muted-foreground text-xs">{t("dropHint")}</p>
            </div>
          </div>
        ) : (
          /* Interactive Cropper Area */
          <div className="space-y-4">
            <div className="relative h-64 w-full overflow-hidden rounded-2xl bg-black/95 sm:h-72">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                rotation={rotation}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onZoomChange={setZoom}
                onRotationChange={setRotation}
                onCropComplete={onCropComplete}
              />
            </div>

            {/* Adjustments: Zoom & Rotate */}
            <div className="space-y-3 px-1">
              {/* Zoom Slider */}
              <div className="flex items-center gap-3">
                <ZoomIn className="text-muted-foreground size-4 shrink-0" />
                <Slider
                  min={1}
                  max={3}
                  step={0.05}
                  value={[zoom]}
                  onValueChange={(vals) => {
                    if (vals[0] !== undefined) {
                      setZoom(vals[0]);
                    }
                  }}
                  className="flex-1"
                />
                <span className="text-muted-foreground w-8 text-right font-mono text-xs">
                  {zoom.toFixed(1)}x
                </span>
              </div>

              {/* Controls Toolbar */}
              <div className="flex items-center justify-between pt-1">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleRotate}
                  className="gap-1.5 rounded-xl text-xs"
                >
                  <RotateCw className="size-3.5" />
                  <span>{t("rotate")} 90°</span>
                </Button>

                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => inputRef.current?.click()}
                  className="rounded-xl text-xs"
                >
                  <ImageIcon className="mr-1.5 size-3.5" />
                  <span>{t("changeImage")}</span>
                </Button>
              </div>
            </div>
          </div>
        )}

        <DialogFooter className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          {currentAvatarUrl ? (
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  disabled={isSaving}
                  className="text-destructive hover:bg-destructive/10 hover:text-destructive w-full rounded-xl text-xs sm:w-auto"
                >
                  <Trash2 className="mr-1.5 size-3.5" />
                  <span>{t("removeAvatar")}</span>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>{t("confirmRemoveTitle")}</AlertDialogTitle>
                  <AlertDialogDescription>
                    {t("confirmRemoveDesc")}
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    variant="destructive"
                    onClick={handleRemove}
                  >
                    Remove
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          ) : (
            <div />
          )}

          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleClose}
              disabled={isSaving}
              className="flex-1 rounded-xl text-xs sm:flex-initial"
            >
              Cancel
            </Button>
            <Button
              type="button"
              size="sm"
              onClick={handleSave}
              disabled={!imageSrc || isSaving}
              className="flex-1 rounded-xl text-xs sm:flex-initial"
            >
              {isSaving ? (
                <>
                  <Loader2 className="mr-1.5 size-3.5 animate-spin" />
                  <span>{t("saving")}</span>
                </>
              ) : (
                <span>{t("saveAvatar")}</span>
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
