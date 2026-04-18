import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { Layout } from '@/components/Layout';
import { useAuth } from '@/context/AuthContext';
import { slideshowService, Slide, CreateSlideRequest, UpdateSlideRequest } from '@/services/slideshowService';
import { imageService } from '@/services/imageService';
import { notificationService } from '@/services/notificationService';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Pagination } from '@/components/Pagination';

export default function AdminSlideshow() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [slides, setSlides] = useState<Slide[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSlide, setEditingSlide] = useState<Slide | null>(null);
  const [formData, setFormData] = useState<CreateSlideRequest>({
    imageUrl: '',
    alt: '',
    title: '',
    subtitle: '',
    ctaText: '',
    ctaLink: '',
    order: 0,
    isActive: true,
  });
  const [uploading, setUploading] = useState(false);
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);
  const [pagination, setPagination] = useState({
    page: 1,
    pageSize: 10,
    totalCount: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login');
      return;
    }

    if (user?.role !== 'admin') {
      router.push('/');
      return;
    }

    fetchSlides();
  }, [isAuthenticated, user, router, pagination.page]);

  const fetchSlides = async () => {
    try {
      setLoading(true);
      const result = await slideshowService.getAll({
        page: pagination.page,
        pageSize: pagination.pageSize,
      });
      
      if (Array.isArray(result)) {
        // Backward compatibility
        setSlides(result.sort((a, b) => a.order - b.order));
        setPagination(prev => ({ ...prev, totalCount: result.length, totalPages: 1 }));
      } else {
        setSlides(result.slides.sort((a, b) => a.order - b.order));
        setPagination({
          ...pagination,
          totalCount: result.totalCount,
          totalPages: result.totalPages,
        });
      }
    } catch (error) {
      notificationService.error('Failed to load slides');
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const imageUrl = await imageService.uploadImage(file);
      setFormData({ ...formData, imageUrl });
      notificationService.success('Image uploaded successfully');
    } catch (error) {
      notificationService.error('Failed to upload image');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingSlide) {
        const updateData: UpdateSlideRequest = {
          imageUrl: formData.imageUrl || undefined,
          alt: formData.alt || undefined,
          title: formData.title || undefined,
          subtitle: formData.subtitle || undefined,
          ctaText: formData.ctaText || undefined,
          ctaLink: formData.ctaLink || undefined,
          order: formData.order ?? undefined,
          isActive: formData.isActive ?? undefined,
        };
        await slideshowService.update(editingSlide.id, updateData);
        notificationService.success('Slide updated successfully');
      } else {
        await slideshowService.create(formData);
        notificationService.success('Slide created successfully');
      }
      setIsModalOpen(false);
      resetForm();
      fetchSlides();
    } catch (error: any) {
      notificationService.error(error.response?.data?.message || 'Failed to save slide');
    }
  };

  const handleEdit = (slide: Slide) => {
    setEditingSlide(slide);
    setFormData({
      imageUrl: slide.imageUrl,
      alt: slide.alt,
      title: slide.title || '',
      subtitle: slide.subtitle || '',
      ctaText: slide.ctaText || '',
      ctaLink: slide.ctaLink || '',
      order: slide.order,
      isActive: slide.isActive,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this slide?')) return;

    try {
      await slideshowService.delete(id);
      notificationService.success('Slide deleted successfully');
      fetchSlides();
    } catch (error) {
      notificationService.error('Failed to delete slide');
    }
  };

  const resetForm = () => {
    setEditingSlide(null);
    setFormData({
      imageUrl: '',
      alt: '',
      title: '',
      subtitle: '',
      ctaText: '',
      ctaLink: '',
      order: 0,
      isActive: true,
    });
  };

  const handleDragStart = (index: number) => {
    setDragIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDrop = async (e: React.DragEvent, dropIndex: number) => {
    e.preventDefault();
    if (dragIndex === null || dragIndex === dropIndex) {
      setDragIndex(null);
      setDragOverIndex(null);
      return;
    }

    const newSlides = [...slides];
    const [removed] = newSlides.splice(dragIndex, 1);
    newSlides.splice(dropIndex, 0, removed);

    setSlides(newSlides);
    setDragIndex(null);
    setDragOverIndex(null);

    // Update order in backend
    try {
      const slideIds = newSlides.map(s => s.id);
      await slideshowService.reorder(slideIds);
      notificationService.success('Slides reordered successfully');
    } catch (error) {
      notificationService.error('Failed to reorder slides');
      fetchSlides(); // Revert on error
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex justify-center items-center min-h-screen">
          <LoadingSpinner size="lg" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 bg-primary min-h-screen">
        <div className="mb-4">
          <Link
            href="/admin"
            className="inline-flex items-center text-button hover:text-button-200 font-medium transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Back to Dashboard
          </Link>
        </div>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-foreground">Manage Slideshow</h1>
          <button
            onClick={() => {
              resetForm();
              setIsModalOpen(true);
            }}
            className="bg-button text-button-text px-6 py-3 rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
          >
            Add New Slide
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slides.map((slide, index) => (
            <div
              key={slide.id}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => handleDragOver(e, index)}
              onDrop={(e) => handleDrop(e, index)}
              onDragEnd={() => {
                setDragIndex(null);
                setDragOverIndex(null);
              }}
              className={`group bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg overflow-hidden cursor-move transition-all border-2 border-foreground/10 hover:border-button/50 hover:scale-105 ${
                dragOverIndex === index ? 'ring-4 ring-button/50 border-button' : ''
              }`}
            >
              <div className="relative h-48 bg-primary/60">
                <img
                  src={slide.imageUrl}
                  alt={slide.alt}
                  className="w-full h-full object-cover"
                />
                {!slide.isActive && (
                  <div className="absolute top-3 right-3 bg-red-500/90 backdrop-blur-sm text-white px-3 py-1 rounded-full text-xs font-bold border-2 border-red-400">
                    Inactive
                  </div>
                )}
              </div>
              <div className="p-5">
                <h3 className="font-bold text-lg mb-2 text-foreground">{slide.title || 'No Title'}</h3>
                <p className="text-sm text-foreground/70 mb-3 line-clamp-2">{slide.subtitle}</p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-foreground/10">
                  <span className="text-xs font-semibold text-foreground/60">Order: {slide.order}</span>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleEdit(slide)}
                      className="text-button hover:text-button-200 text-sm font-semibold transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(slide.id)}
                      className="text-red-400 hover:text-red-300 text-sm font-semibold transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {slides.length === 0 && (
          <div className="text-center py-12 bg-primary/80 backdrop-blur-xl rounded-3xl shadow-glass-lg border-2 border-foreground/10">
            <p className="text-foreground/60">No slides found. Create your first slide to get started.</p>
          </div>
        )}
        
        <Pagination
          page={pagination.page}
          pageSize={pagination.pageSize}
          totalCount={pagination.totalCount}
          totalPages={pagination.totalPages}
          onPageChange={(page) => setPagination({ ...pagination, page })}
        />
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-primary/95 backdrop-blur-xl rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border-2 border-foreground/20 shadow-glass-lg">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-foreground">
                  {editingSlide ? 'Edit Slide' : 'Create New Slide'}
                </h2>
                <button
                  onClick={() => {
                    setIsModalOpen(false);
                    resetForm();
                  }}
                  className="text-foreground/60 hover:text-foreground transition-colors"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Image URL <span className="text-gold-400">*</span>
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={formData.imageUrl}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      className="flex-1 border border-foreground/20 rounded-xl px-4 py-3 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                      placeholder="https://res.cloudinary.com/..."
                      required
                    />
                    <label className="bg-button text-button-text px-6 py-3 rounded-xl cursor-pointer hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
                      {uploading ? 'Uploading...' : 'Upload'}
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                        disabled={uploading}
                      />
                    </label>
                  </div>
                  {formData.imageUrl && (
                    <img
                      src={formData.imageUrl}
                      alt="Preview"
                      className="mt-3 h-32 w-full object-cover rounded-xl border-2 border-foreground/20 shadow-lg"
                    />
                  )}
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Alt Text <span className="text-gold-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.alt}
                    onChange={(e) => setFormData({ ...formData, alt: e.target.value })}
                    className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                    placeholder="Professional athlete in sportswear"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                    placeholder="Handcrafted fashion for bold, modern sportswear"
                  />
                </div>

                <div>
                  <label className="block text-sm font-semibold text-foreground mb-2">
                    Subtitle
                  </label>
                  <textarea
                    value={formData.subtitle}
                    onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
                    className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                    rows={3}
                    placeholder="where artistry meets sophistication..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      CTA Text
                    </label>
                    <input
                      type="text"
                      value={formData.ctaText}
                      onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                      className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                      placeholder="Shop Now"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      CTA Link
                    </label>
                    <input
                      type="text"
                      value={formData.ctaLink}
                      onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                      className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                      placeholder="/products"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-foreground mb-2">
                      Order
                    </label>
                    <input
                      type="number"
                      value={formData.order}
                      onChange={(e) => setFormData({ ...formData, order: parseInt(e.target.value) || 0 })}
                      className="w-full border border-foreground/20 rounded-xl px-4 py-3 bg-primary/60 backdrop-blur-sm text-foreground placeholder-foreground/50 focus:ring-2 focus:ring-button/50 focus:border-button/50 transition-all"
                      min="0"
                    />
                  </div>
                  <div className="flex items-center pt-8">
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        className="mr-2 w-4 h-4 rounded border-foreground/30 text-button focus:ring-button/50"
                      />
                      <span className="text-sm font-semibold text-foreground">Active</span>
                    </label>
                  </div>
                </div>

                <div className="flex justify-end gap-4 pt-6 border-t border-foreground/10">
                  <button
                    type="button"
                    onClick={() => {
                      setIsModalOpen(false);
                      resetForm();
                    }}
                    className="px-6 py-3 border border-foreground/20 rounded-xl hover:bg-primary/60 text-foreground transition-all font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-button text-button-text rounded-xl hover:bg-button-200 font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                  >
                    {editingSlide ? 'Update' : 'Create'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
}

