import React, { useState } from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Chip from "@mui/material/Chip";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import NavigateNextIcon from "@mui/icons-material/NavigateNext";
import NavigateBeforeIcon from "@mui/icons-material/NavigateBefore";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import CloseIcon from "@mui/icons-material/Close";
import ZoomInIcon from "@mui/icons-material/ZoomIn";
import ZoomOutIcon from "@mui/icons-material/ZoomOut";
import RotateLeftIcon from "@mui/icons-material/RotateLeft";
import RotateRightIcon from "@mui/icons-material/RotateRight";
import FlipIcon from "@mui/icons-material/Flip";
import Dialog from "@mui/material/Dialog";
import FullscreenIcon from "@mui/icons-material/Fullscreen";
import CloseFullscreenIcon from "@mui/icons-material/CloseFullscreen";

export type ImageLabel = "ktp" | "kk" | null;

interface ImageLabelData {
  src: string;
  label: ImageLabel;
}

interface ImageLabelingViewerProps {
  images: Array<{ src: string }>;
  container: HTMLElement | null;
  onLabelsComplete?: (labels: Record<number, ImageLabel>) => void;
  initialLabels?: Record<number, ImageLabel>;
  disabled?: boolean;
}

const LABEL_OPTIONS = [
  { value: "ktp" as const, label: "Foto KTP", color: "#8b5cf6" },
  { value: "kk" as const, label: "Foto KK", color: "#ec4899" },
];

const REQUIRED_LABELS = 2;

export default function ImageLabelingViewer({
  images,
  container,
  onLabelsComplete,
  initialLabels = {},
  disabled = false,
}: ImageLabelingViewerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [imageLabels, setImageLabels] =
    useState<Record<number, ImageLabel>>(initialLabels);
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0); // derajat
  const [flipX, setFlipX] = useState(false);
  const [flipY, setFlipY] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleLabelClick = (label: ImageLabel) => {
    if (disabled) return;

    const newLabels = { ...imageLabels, [currentIndex]: label };
    setImageLabels(newLabels);

    const nextUnlabeled = images.findIndex(
      (_, idx) => idx > currentIndex && !newLabels[idx],
    );

    if (nextUnlabeled !== -1) {
      setCurrentIndex(nextUnlabeled);
    } else if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
    onLabelsComplete?.(newLabels);
  };

  const handleRemoveLabel = () => {
    if (disabled || !currentLabel) return;

    const newLabels = { ...imageLabels };
    delete newLabels[currentIndex];
    setImageLabels(newLabels);
    onLabelsComplete?.(newLabels);
  };

  const handleRotateLeft = () => {
    setRotation((prev) => prev - 90);
  };

  const handleRotateRight = () => {
    setRotation((prev) => prev + 90);
  };

  const handleFlipHorizontal = () => {
    setFlipX((prev) => !prev);
  };

  const handleFlipVertical = () => {
    setFlipY((prev) => !prev);
  };

  const resetTransform = () => {
    setZoom(1);
    setRotation(0);
    setFlipX(false);
    setFlipY(false);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      resetTransform();
    }
  };

  const handleNext = () => {
    if (currentIndex < images.length - 1) {
      setCurrentIndex(currentIndex + 1);
      resetTransform();
    }
  };

  const handleZoomIn = () => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  };

  const handleZoomOut = () => {
    setZoom((prev) => Math.max(prev - 0.25, 0.5));
  };

  const currentLabel = imageLabels[currentIndex];
  const isLabelUsed = (label: ImageLabel) => {
    return Object.values(imageLabels).includes(label);
  };

  const hasKTP = Object.values(imageLabels).includes("ktp");
  const hasKK = Object.values(imageLabels).includes("kk");
  const allLabeled = hasKTP && hasKK;
  const labeledCount = Object.keys(imageLabels).length;

  return (
    <Box sx={{ width: "100%" }}>
      {/* Thumbnail Preview at Top */}
      <Box sx={{ mb: 1.25 }}>
        <Typography
          variant="body2"
          fontWeight={600}
          color="text.secondary"
          sx={{ mb: 0.75, fontSize: "0.75rem" }}
        >
          Preview Semua Foto:
        </Typography>
        <Stack direction="row" spacing={0.75}>
          {images.map((image, index) => {
            const label = imageLabels[index];
            const labelOption = LABEL_OPTIONS.find(
              (opt) => opt.value === label,
            );

            return (
              <Box
                key={index}
                onClick={() => {
                  setCurrentIndex(index);
                  setZoom(1);
                }}
                sx={{
                  position: "relative",
                  width: 65,
                  height: 65,
                  cursor: "pointer",
                  border:
                    currentIndex === index
                      ? "2.5px solid #3b82f6"
                      : "1.5px solid #d1d5db",
                  borderRadius: 1.5,
                  overflow: "hidden",
                  flexShrink: 0,
                  transition: "all 0.2s ease",
                  boxShadow:
                    currentIndex === index
                      ? "0 2px 8px rgba(59, 130, 246, 0.3)"
                      : "none",
                  "&:hover": {
                    borderColor: "#3b82f6",
                    transform: "translateY(-2px)",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                  },
                }}
              >
                <img
                  src={image.src}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
                {label && (
                  <Box
                    sx={{
                      position: "absolute",
                      bottom: 0,
                      left: 0,
                      right: 0,
                      bgcolor: labelOption?.color,
                      color: "white",
                      fontSize: "0.6rem",
                      textAlign: "center",
                      py: 0.2,
                      fontWeight: 700,
                      letterSpacing: "0.02em",
                    }}
                  >
                    {labelOption?.label}
                  </Box>
                )}
                <Box
                  sx={{
                    position: "absolute",
                    top: 3,
                    right: 3,
                    bgcolor: "rgba(0,0,0,0.75)",
                    color: "white",
                    fontSize: "0.65rem",
                    px: 0.5,
                    py: 0.15,
                    borderRadius: 0.75,
                    fontWeight: 700,
                    lineHeight: 1,
                  }}
                >
                  {index + 1}
                </Box>
              </Box>
            );
          })}
        </Stack>
      </Box>

      {/* Label Action Buttons */}
      {!disabled && (
        <Box sx={{ mb: 1.25 }}>
          <Typography
            variant="body2"
            fontWeight={600}
            color="text.secondary"
            sx={{ mb: 0.75, fontSize: "0.75rem" }}
          >
            Tandai foto ini sebagai:
          </Typography>
          <Stack direction="row" spacing={0.75}>
            {LABEL_OPTIONS.map((option) => {
              const isUsed = isLabelUsed(option.value);
              const isCurrent = currentLabel === option.value;

              return (
                <Button
                  key={option.value}
                  variant="outlined"
                  size="small"
                  onClick={() => handleLabelClick(option.value)}
                  disabled={isUsed && !isCurrent}
                  sx={{
                    flex: 1,
                    height: 38,
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    bgcolor: isCurrent ? `${option.color}15` : "white",
                    borderColor: option.color,
                    borderWidth: 2,
                    color: option.color,
                    textTransform: "none",
                    letterSpacing: "0.01em",
                    "&:hover": {
                      bgcolor: `${option.color}20`,
                      borderColor: option.color,
                      borderWidth: 2,
                      transform: "translateY(-1px)",
                      boxShadow: "0 3px 10px rgba(0,0,0,0.1)",
                    },
                    "&.Mui-disabled": {
                      bgcolor: "#f5f5f5",
                      borderColor: "#d1d5db",
                      borderWidth: 2,
                      color: "#9ca3af",
                    },
                    transition: "all 0.2s ease",
                  }}
                  startIcon={
                    isCurrent && (
                      <CheckCircleIcon sx={{ fontSize: "1rem !important" }} />
                    )
                  }
                >
                  {option.label}
                </Button>
              );
            })}

            {currentLabel && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                onClick={handleRemoveLabel}
                sx={{
                  height: 38,
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  px: 1.5,
                  minWidth: 120,
                  textTransform: "none",
                  borderWidth: 2,
                  "&:hover": {
                    borderWidth: 2,
                    transform: "translateY(-1px)",
                    boxShadow: "0 3px 10px rgba(239, 68, 68, 0.2)",
                  },
                  transition: "all 0.2s ease",
                }}
                startIcon={<CloseIcon sx={{ fontSize: "1rem !important" }} />}
              >
                Batal Tandai
              </Button>
            )}
          </Stack>
        </Box>
      )}

      {/* Status Labels - More Compact */}
      <Paper
        elevation={0}
        sx={{
          p: 1.25,
          bgcolor: allLabeled ? "#f0fdf4" : "#fef3c7",
          border: `1.5px solid ${allLabeled ? "#86efac" : "#fde047"}`,
          borderRadius: 1.5,
          mb: 1.25,
        }}
      >
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ mb: 0.75 }}
        >
          <Typography
            variant="body2"
            fontWeight={700}
            color="text.primary"
            sx={{ fontSize: "0.8rem" }}
          >
            Status Label: {labeledCount}/{REQUIRED_LABELS} foto telah ditandai
          </Typography>
          {!allLabeled && !disabled && (
            <Chip
              icon={<WarningAmberIcon sx={{ fontSize: "0.9rem !important" }} />}
              label="Tandai KTP dan KK"
              size="small"
              sx={{
                bgcolor: "#fef3c7",
                color: "#92400e",
                fontSize: "0.65rem",
                fontWeight: 600,
                height: 22,
                border: "1px solid #fde047",
              }}
            />
          )}
        </Stack>
        <Stack direction="row" spacing={0.75}>
          {LABEL_OPTIONS.map((option) => {
            const imageIndex = Object.entries(imageLabels).find(
              ([_, label]) => label === option.value,
            )?.[0];
            const isLabeled = imageIndex !== undefined;

            return (
              <Chip
                key={option.value}
                label={`${option.label} ${isLabeled ? `- Foto ${parseInt(imageIndex!) + 1}` : ""}`}
                icon={
                  isLabeled ? (
                    <CheckCircleIcon sx={{ fontSize: "0.9rem !important" }} />
                  ) : (
                    <Box
                      sx={{
                        width: 14,
                        height: 14,
                        borderRadius: "50%",
                        border: "2px solid currentColor",
                      }}
                    />
                  )
                }
                size="small"
                sx={{
                  bgcolor: isLabeled ? `${option.color}20` : "white",
                  borderColor: option.color,
                  color: option.color,
                  border: "1.5px solid",
                  fontSize: "0.7rem",
                  fontWeight: 600,
                  height: 26,
                  px: 1,
                }}
              />
            );
          })}
        </Stack>
      </Paper>

      {/* Custom Image Viewer - More Compact */}
      <Box
        sx={{
          position: "relative",
          bgcolor: "#1a1a1a",
          borderRadius: 1.5,
          overflow: "hidden",
          border: "1px solid #374151",
          minHeight: 350,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {/* Image Container */}
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            overflow: "auto",
            p: 1.5,
          }}
        >
          <img
            src={images[currentIndex]?.src || ""}
            alt={`Foto ${currentIndex + 1}`}
            style={{
              maxWidth: "100%",
              maxHeight: "500px",
              objectFit: "contain",
              transform: `
      scale(${zoom})
      rotate(${rotation}deg)
      scaleX(${flipX ? -1 : 1})
      scaleY(${flipY ? -1 : 1})
    `,
              transition: "transform 0.2s ease",
              cursor: zoom > 1 ? "grab" : "default",
            }}
          />
        </Box>

        {/* Navigation Arrows */}
        <Box
          sx={{
            position: "absolute",
            top: "50%",
            left: 0,
            right: 0,
            transform: "translateY(-50%)",
            display: "flex",
            justifyContent: "space-between",
            px: 1,
            pointerEvents: "none",
          }}
        >
          <IconButton
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              color: "#1a1a1a",
              pointerEvents: "auto",
              width: 36,
              height: 36,
              "&:hover": {
                bgcolor: "white",
                transform: "scale(1.1)",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(255,255,255,0.3)",
                color: "rgba(0,0,0,0.3)",
              },
              transition: "all 0.2s",
            }}
          >
            <NavigateBeforeIcon fontSize="small" />
          </IconButton>
          <IconButton
            onClick={handleNext}
            disabled={currentIndex === images.length - 1}
            size="small"
            sx={{
              bgcolor: "rgba(255,255,255,0.9)",
              color: "#1a1a1a",
              pointerEvents: "auto",
              width: 36,
              height: 36,
              "&:hover": {
                bgcolor: "white",
                transform: "scale(1.1)",
              },
              "&.Mui-disabled": {
                bgcolor: "rgba(255,255,255,0.3)",
                color: "rgba(0,0,0,0.3)",
              },
              transition: "all 0.2s",
            }}
          >
            <NavigateNextIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Top Controls - More Compact */}
        <Box
          sx={{
            position: "absolute",
            top: 10,
            left: 10,
            right: 10,
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          {/* Current Label Badge */}
          {currentLabel && (
            <Chip
              label={
                LABEL_OPTIONS.find((opt) => opt.value === currentLabel)?.label
              }
              size="small"
              sx={{
                bgcolor: LABEL_OPTIONS.find((opt) => opt.value === currentLabel)
                  ?.color,
                color: "white",
                fontWeight: 700,
                fontSize: "0.7rem",
                height: 24,
              }}
            />
          )}
          <Box sx={{ flex: 1 }} />

          {/* Zoom Controls - Compact */}
          <Stack direction="row" spacing={0.4}>
            <IconButton
              size="small"
              onClick={handleZoomOut}
              disabled={zoom <= 0.5}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                color: "#1a1a1a",
                width: 28,
                height: 28,
                "&:hover": { bgcolor: "white" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  color: "rgba(0,0,0,0.3)",
                },
              }}
            >
              <ZoomOutIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
            <Box
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                color: "#1a1a1a",
                px: 1,
                py: 0.4,
                borderRadius: 1,
                fontSize: "0.7rem",
                fontWeight: 700,
                display: "flex",
                alignItems: "center",
                minWidth: 45,
                justifyContent: "center",
              }}
            >
              {Math.round(zoom * 100)}%
            </Box>
            <IconButton
              size="small"
              onClick={handleZoomIn}
              disabled={zoom >= 3}
              sx={{
                bgcolor: "rgba(255,255,255,0.9)",
                color: "#1a1a1a",
                width: 28,
                height: 28,
                "&:hover": { bgcolor: "white" },
                "&.Mui-disabled": {
                  bgcolor: "rgba(255,255,255,0.3)",
                  color: "rgba(0,0,0,0.3)",
                },
              }}
            >
              <ZoomInIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Stack>
          <Stack direction="row" spacing={0.4} sx={{ mr: 1 }}>
            <IconButton
              size="small"
              onClick={handleRotateLeft}
              sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
            >
              <RotateLeftIcon sx={{ fontSize: "1rem" }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleRotateRight}
              sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
            >
              <RotateRightIcon sx={{ fontSize: "1rem" }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleFlipHorizontal}
              sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
            >
              <FlipIcon sx={{ fontSize: "1rem", transform: "scaleX(-1)" }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={handleFlipVertical}
              sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
            >
              <FlipIcon sx={{ fontSize: "1rem", transform: "rotate(90deg)" }} />
            </IconButton>

            <IconButton
              size="small"
              onClick={() => setIsFullscreen(true)}
              sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
            >
              <FullscreenIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Stack>
        </Box>

        {/* Image Counter - Compact */}
        <Box
          sx={{
            position: "absolute",
            bottom: 10,
            right: 10,
            bgcolor: "rgba(255,255,255,0.9)",
            color: "#1a1a1a",
            px: 1.25,
            py: 0.4,
            borderRadius: 1,
            fontSize: "0.7rem",
            fontWeight: 700,
          }}
        >
          {currentIndex + 1} of {images.length}
        </Box>
      </Box>
      <Dialog
        open={isFullscreen}
        onClose={() => setIsFullscreen(false)}
        maxWidth="xl"
        fullWidth
        scroll="body"
        PaperProps={{
          sx: {
            height: "90vh",
            bgcolor: "#000",
            borderRadius: 3,
          },
        }}
      >
        {/* ===== TOP ACTION BAR ===== */}
        <Stack
          direction="row"
          alignItems="center"
          spacing={0.5}
          sx={{
            position: "absolute",
            top: 12,
            left: 12,
            right: 12,
            zIndex: 20,
          }}
        >
          {/* Close */}
          <IconButton
            size="small"
            onClick={() => setIsFullscreen(false)}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <CloseFullscreenIcon />
          </IconButton>

          {/* Prev */}
          <IconButton
            size="small"
            onClick={() => setCurrentIndex((prev) => Math.max(prev - 1, 0))}
            disabled={currentIndex === 0}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <NavigateBeforeIcon />
          </IconButton>

          {/* Next */}
          <IconButton
            size="small"
            onClick={() =>
              setCurrentIndex((prev) => Math.min(prev + 1, images.length - 1))
            }
            disabled={currentIndex === images.length - 1}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <NavigateNextIcon />
          </IconButton>

          {/* Zoom In */}
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.min(z + 0.1, 3))}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <ZoomInIcon />
          </IconButton>

          {/* Zoom Out */}
          <IconButton
            size="small"
            onClick={() => setZoom((z) => Math.max(z - 0.1, 0.5))}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <ZoomOutIcon />
          </IconButton>

          {/* Rotate */}
          <IconButton
            size="small"
            onClick={() => setRotation((r) => r + 90)}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <RotateRightIcon />
          </IconButton>

          {/* Flip X */}
          <IconButton
            size="small"
            onClick={() => setFlipX((f) => !f)}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <FlipIcon />
          </IconButton>

          {/* Flip Y */}
          <IconButton
            size="small"
            onClick={() => setFlipY((f) => !f)}
            sx={{ bgcolor: "rgba(255,255,255,0.9)" }}
          >
            <FlipIcon sx={{ transform: "rotate(90deg)" }} />
          </IconButton>
        </Stack>

        {/* ===== LABEL BADGE ===== */}
        {currentLabel && (
          <Chip
            label={LABEL_OPTIONS.find((o) => o.value === currentLabel)?.label}
            sx={{
              position: "absolute",
              top: 14,
              right: 14,
              bgcolor: LABEL_OPTIONS.find((o) => o.value === currentLabel)
                ?.color,
              color: "white",
              fontWeight: 700,
              zIndex: 20,
            }}
          />
        )}

        {/* ===== IMAGE ===== */}
        <Box
          sx={{
            position: "relative",
            width: "100%",
            height: "100%",
            overflow: "hidden",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Box
            sx={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <img
              src={images[currentIndex]?.src}
              alt="Preview"
              style={{
                maxWidth: "100%",
                maxHeight: "100%",
                objectFit: "contain",
                transform: `
          scale(${zoom})
          rotate(${rotation}deg)
          scaleX(${flipX ? -1 : 1})
          scaleY(${flipY ? -1 : 1})
        `,
                transformOrigin: "center center",
                transition: "transform 0.2s ease",
              }}
            />
          </Box>
        </Box>
      </Dialog>
    </Box>
  );
}
