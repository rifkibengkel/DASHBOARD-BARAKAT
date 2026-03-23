import { getBase64 } from "@/lib/utils";
import { useModalStore } from "@/stores/useModal";
import { useNotificationStore } from "@/stores/useNotification";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  NavigateBefore as NavigateBeforeIcon,
  NavigateNext as NavigateNextIcon,
  CloudUpload as UploadIcon,
  ZoomIn as ZoomInIcon,
  ZoomOut as ZoomOutIcon,
  RotateLeft as RotateLeftIcon,
  RotateRight as RotateRightIcon,
  RestartAlt as RestartAltIcon,
} from "@mui/icons-material";
import { Paper } from "@mui/material";
import Backdrop from "@mui/material/Backdrop";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Card from "@mui/material/Card";
import CardActions from "@mui/material/CardActions";
import CardMedia from "@mui/material/CardMedia";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import Grid from "@mui/material/Grid";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Typography from "@mui/material/Typography";
import React, { useEffect, useState, useRef } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Type definitions
interface ImageItem {
  id: number;
  url: string;
  name: string;
  file?: File;
  isDelete?: boolean;
}

interface ModalImageComponentProps {
  keys: string;
}

function ModalImageComponent({ keys }: ModalImageComponentProps) {
  const { modals, hideModal } = useModalStore();
  const { notify } = useNotificationStore();
  const modal = modals["winner-images"];
  const [isDragging, setIsDragging] = useState(false);
  const [rotation, setRotation] = useState(0);

  const [loading, setLoading] = useState<boolean>(false);
  const [images, setImages] = useState<ImageItem[]>([]);
  const [previewImage, setPreviewImage] = useState<ImageItem | null>(null);

  // ref for controlling transform wrapper programmatically
  const transformRef = useRef<any>(null);

  const handleClose = () => {
    hideModal("winner-images");
  };

  useEffect(() => {
    if (!modal) return;

    const fetchHistory = async () => {
      try {
        setLoading(true);

        const res = await fetch(`/api/winner/images?id=${modal.id}`);
        const data = await res.json();
        setImages(data.data || []);
      } catch (err) {
        console.error("Failed to fetch winner images:", err);
      } finally {
        setLoading(false);
      }
    };

    if (modal?.id) {
      fetchHistory();
    }
  }, [modal]);

  // Handle image upload with proper typing
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    const filesArray = Array.from(files);
    const newImages: ImageItem[] = filesArray.map((file, index) => ({
      id: Date.now() + index,
      url: URL.createObjectURL(file),
      name: file.name,
      file: file,
    }));

    setImages((prevImages) => [...prevImages, ...newImages]);
    notify({
      message: `${filesArray.length} gambar berhasil ditambahkan`,
      type: "success",
    });
  };

  const handleDelete = (id: number) => {
    setImages((prevImages) =>
      prevImages.map((img) =>
        img.id === id ? { ...img, isDelete: true } : img
      )
    );

    // Tutup preview kalau gambar yang dihapus sedang dipreview
    if (previewImage?.id === id) {
      setPreviewImage(null);
    }

    notify({
      message: "Gambar berhasil ditandai untuk dihapus",
      type: "success",
    });
  };

  // Handle preview image
  const handlePreviewImage = (image: ImageItem) => {
    setPreviewImage(image);
    // reset transform when opening a new image
    if (transformRef.current) {
      try {
        transformRef.current.resetTransform();
      } catch {
        /* ignore */
      }
    }
  };

  const handleClosePreview = () => {
    setPreviewImage(null);
  };

  // Navigate through images in preview
  const handlePrevImage = () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex((img) => img.id === previewImage.id);
    const prevIndex = currentIndex > 0 ? currentIndex - 1 : images.length - 1;
    setPreviewImage(images[prevIndex]);
    // reset transform on navigation
    if (transformRef.current) transformRef.current.resetTransform();
  };

  const handleNextImage = () => {
    if (!previewImage) return;
    const currentIndex = images.findIndex((img) => img.id === previewImage.id);
    const nextIndex = currentIndex < images.length - 1 ? currentIndex + 1 : 0;
    setPreviewImage(images[nextIndex]);
    if (transformRef.current) transformRef.current.resetTransform();
  };

  // Handle save
  const handleSave = async () => {
    setLoading(true);

    try {
      const sender = images[0].url.split("/").pop()?.split("_").slice()[0];
      for (let i = 0; i < images.length; i++) {
        const file = images[i].file;
        const isDelete = images[i].isDelete;
        const url = images[i].url;
        // Jika ada file maka tambah
        if (file && !isDelete) {
          const base64 = await getBase64(file);
          const response = await fetch(
            `/api/winner/image?params=image&id=${modal.id}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                image: base64,
                sender,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to Upload Image");
          }

          notify({
            message: "Upload image success",
            type: "success",
          });

          handleClose();
        }
        // jika diberi flag isDelete maka hit api
        if (isDelete) {
          const response = await fetch(
            `/api/winner/image?params=image&id=${modal.id}`,
            {
              method: "DELETE",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                url,
              }),
            }
          );

          if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || "Failed to Delete Image");
          }
        }
      }
    } catch (error) {
      console.error("Error Saving Image:", error);
      notify({
        message: "Failed to Save Image",
        type: "error",
      });
    } finally {
      setLoading(false);
    }

    notify({
      message: `Success Saving Images`,
      type: "success",
    });
    handleClose();
  };

  return (
    <>
      <Dialog
        open={Boolean(modal?.show)}
        maxWidth="md"
        fullWidth
        slotProps={{
          paper: {
            sx: {
              maxHeight: 735,
            },
          },
        }}
        onClose={handleClose}
      >
        <DialogTitle
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid",
            borderColor: "divider",
            pb: 2,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            Image Gallery
          </Typography>
          <IconButton
            onClick={handleClose}
            sx={{
              color: "grey.500",
              "&:hover": { color: "grey.700", bgcolor: "grey.100" },
            }}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent sx={{ pt: 3, pb: 3 }}>
          <Grid container spacing={2} mt={2}>
            {/* Image Cards */}
            {images
              .filter((img) => !img.isDelete)
              .map((image) => (
                <Grid size={{ xs: 4 }} key={image.id}>
                  <Card
                    sx={{
                      height: 200,
                      position: "relative",
                      cursor: "pointer",
                      transition: "all 0.3s",
                      border: "1px solid",
                      borderColor: "divider",
                      "&:hover": {
                        transform: "scale(1.02)",
                        boxShadow: 4,
                        "& .action-buttons": {
                          opacity: 1,
                        },
                      },
                    }}
                    onClick={() => handlePreviewImage(image)}
                  >
                    <CardMedia
                      component="img"
                      height="150"
                      image={image.url}
                      alt={image.name}
                      sx={{ objectFit: "cover" }}
                    />

                    {/* Zoom Icon Indicator */}
                    <Box
                      sx={{
                        position: "absolute",
                        top: 8,
                        right: 8,
                        bgcolor: "rgba(0,0,0,0.5)",
                        borderRadius: "50%",
                        p: 0.5,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                      }}
                    >
                      <ZoomInIcon sx={{ color: "white", fontSize: 20 }} />
                    </Box>

                    {/* Action Buttons */}
                    <CardActions
                      className="action-buttons"
                      sx={{
                        position: "absolute",
                        bottom: 0,
                        left: 0,
                        right: 0,
                        bgcolor: "rgba(0,0,0,0.6)",
                        opacity: 0,
                        transition: "opacity 0.3s",
                        justifyContent: "space-between",
                        px: 1,
                      }}
                    >
                      <Typography
                        variant="caption"
                        sx={{
                          color: "white",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                          flex: 1,
                          mr: 1,
                        }}
                      >
                        {image.name}
                      </Typography>
                      <Tooltip title="Hapus">
                        <IconButton
                          size="small"
                          onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                            e.stopPropagation();
                            handleDelete(image.id);
                          }}
                          sx={{
                            color: "error.main",
                            boxShadow: "none",
                            "&:hover": {
                              bgcolor: "error.main",
                              color: "white",
                              boxShadow: "0px 4px 10px rgba(255,0,0,0.7)", // shadow merah saat hover
                            },
                          }}
                          aria-label="delete image"
                        >
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Grid>
              ))}

            {/* Upload Area */}
            <Grid size={{ xs: 4 }}>
              <Card
                sx={{
                  height: 200,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: "2px dashed",
                  borderColor: isDragging ? "primary.dark" : "primary.main",
                  bgcolor: isDragging ? "primary.100" : "primary.50",
                  cursor: "pointer",
                  transition: "all 0.3s",
                  "&:hover": {
                    bgcolor: "primary.100",
                    transform: "scale(1.02)",
                    boxShadow: 2,
                  },
                }}
                component="label"
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={(e) => {
                  e.preventDefault();
                  setIsDragging(false);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDragging(false);

                  const files = e.dataTransfer.files;
                  if (files.length === 0) return;

                  const filesArray = Array.from(files);
                  const newImages: ImageItem[] = filesArray.map(
                    (file, index) => ({
                      id: Date.now() + index,
                      url: URL.createObjectURL(file),
                      name: file.name,
                      file,
                    })
                  );

                  setImages((prev) => [...prev, ...newImages]);
                  notify({
                    message: `${filesArray.length} gambar berhasil ditambahkan`,
                    type: "success",
                  });
                }}
              >
                <input
                  type="file"
                  hidden
                  multiple
                  accept="image/*"
                  onChange={handleImageUpload}
                />
                <UploadIcon
                  sx={{ fontSize: 48, color: "primary.main", mb: 1 }}
                />
                <Typography variant="body2" color="primary" fontWeight={500}>
                  Klik untuk upload
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={0.5}>
                  atau drag & drop
                </Typography>
              </Card>
            </Grid>
          </Grid>

          {/* Empty State */}
          {images.length === 0 && (
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                minHeight: 300,
                color: "text.secondary",
              }}
            >
              <UploadIcon sx={{ fontSize: 80, mb: 2, opacity: 0.3 }} />
              <Typography variant="h6" gutterBottom>
                Belum ada gambar
              </Typography>
              <Typography variant="body2">
                Upload gambar pertama Anda
              </Typography>
            </Box>
          )}
        </DialogContent>

        {/* Footer Actions */}
        <DialogActions
          sx={{
            px: 3,
            py: 2,
            borderTop: "1px solid",
            borderColor: "divider",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Typography variant="body2" color="text.secondary">
            {images.length} gambar
          </Typography>
          <Box sx={{ display: "flex", gap: 1 }}>
            <Button variant="outlined" onClick={handleClose}>
              Batal
            </Button>
            <Button
              variant="contained"
              disabled={images.length === 0}
              onClick={handleSave}
            >
              Simpan
            </Button>
          </Box>
        </DialogActions>
      </Dialog>

      {/* Image Preview Modal */}
      <Dialog
        open={Boolean(previewImage)}
        onClose={handleClosePreview}
        maxWidth="md"
        fullWidth
      >
        <Backdrop
          open={Boolean(previewImage)}
          onClick={handleClosePreview}
          sx={{
            position: "absolute",
            zIndex: -1,
            bgcolor: "rgba(0, 0, 0, 0.9)",
          }}
        />
        {previewImage && (
          <Paper
            elevation={0}
            sx={{
              position: "relative",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              minHeight: "80vh",
            }}
          >
            {/* Close Button */}
            <IconButton
              onClick={handleClosePreview}
              sx={{
                position: "absolute",
                top: 16,
                right: 16,
                color: "grey.500",
                "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                zIndex: 1,
              }}
            >
              <CloseIcon />
            </IconButton>

            {/* Prev Button */}
            {images.length > 1 && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handlePrevImage();
                }}
                sx={{
                  position: "absolute",
                  left: 16,
                  color: "grey.500",
                  "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                  zIndex: 1,
                }}
              >
                <NavigateBeforeIcon fontSize="large" />
              </IconButton>
            )}

            {/* Zoom + Drag Wrapper */}
            <TransformWrapper
              ref={transformRef}
              initialScale={1}
              minScale={0.5}
              maxScale={6}
              wheel={{ step: 0.2 }}
              doubleClick={{ mode: "zoomIn" }}
              limitToBounds={false}
            >
              {({ zoomIn, zoomOut, resetTransform }) => (
                <>
                  {/* IMAGE DISPLAY */}
                  <TransformComponent>
                    <img
                      src={previewImage.url}
                      alt={previewImage.name}
                      style={{
                        maxHeight: "75vh",
                        maxWidth: "100%",
                        objectFit: "contain",
                        userSelect: "none",
                        borderRadius: 8,
                        transform: `rotate(${rotation}deg)`,
                        transition: "transform 0.25s ease",
                      }}
                      draggable={false}
                    />
                  </TransformComponent>

                  {/* TOOLBAR — moved to bottom */}
                  <Box
                    onClick={(e) => e.stopPropagation()}
                    sx={{
                      position: "absolute",
                      bottom: 12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      p: 1.2,
                      px: 2,
                      borderRadius: 2,
                      display: "flex",
                      gap: 1.5,
                      zIndex: 20,
                    }}
                  >
                    {/* ZOOM IN */}
                    <Tooltip title="Zoom In">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          zoomIn();
                        }}
                        sx={{
                          color: "grey.500",
                          "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                        }}
                      >
                        <ZoomInIcon />
                      </IconButton>
                    </Tooltip>

                    {/* ZOOM OUT */}
                    <Tooltip title="Zoom Out">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          zoomOut();
                        }}
                        sx={{
                          color: "grey.500",
                          "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                        }}
                      >
                        <ZoomOutIcon />
                      </IconButton>
                    </Tooltip>

                    {/* ROTATE LEFT */}
                    <Tooltip title="Putar Kiri">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setRotation((r) => r - 90);
                        }}
                        sx={{
                          color: "grey.500",
                          "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                        }}
                      >
                        <RotateLeftIcon />
                      </IconButton>
                    </Tooltip>

                    {/* ROTATE RIGHT */}
                    <Tooltip title="Putar Kanan">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          setRotation((r) => r + 90);
                        }}
                        sx={{
                          color: "grey.500",
                          "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                        }}
                      >
                        <RotateRightIcon />
                      </IconButton>
                    </Tooltip>

                    {/* RESET */}
                    <Tooltip title="Reset">
                      <IconButton
                        onClick={(e) => {
                          e.stopPropagation();
                          resetTransform();
                          setRotation(0);
                        }}
                        sx={{
                          color: "grey.500",
                          "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                        }}
                      >
                        <RestartAltIcon />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </>
              )}
            </TransformWrapper>

            {/* Next Button */}
            {images.length > 1 && (
              <IconButton
                onClick={(e) => {
                  e.stopPropagation();
                  handleNextImage();
                }}
                sx={{
                  position: "absolute",
                  right: 16,
                  color: "grey.500",
                  "&:hover": { color: "grey.700", bgcolor: "grey.100" },
                  zIndex: 1,
                }}
              >
                <NavigateNextIcon fontSize="large" />
              </IconButton>
            )}
          </Paper>
        )}
      </Dialog>
    </>
  );
}

const ModalImage = React.memo(ModalImageComponent);
export default ModalImage;
