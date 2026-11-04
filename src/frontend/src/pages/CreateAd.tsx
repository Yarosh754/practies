import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAds } from '../contexts/AdContext';
import { useAuth } from '../contexts/AuthContext';
import { useDictionaries } from '../contexts/DictionariesContext';
import './CreateAd.css';
import { toast } from 'sonner';
import { prepareImageFile } from '../utils/imageUtils';
import { getApiErrorMessage } from '../api/helpers';
import type { components } from '../api/schema';
import ImageComponent from '../components/ImageComponent';

type CreateAdRequest = components['schemas']['CreateAdRequest'];

interface FormState {
  title: string;
  images: string[];
  description: string;
  price: string;
  categoryId: string;
  location: string;
  phone: string;
}

const DELETE_IMG = '/icons/delete-img.png';

function CreateAd() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { getAd, createAd, updateAd, uploadImage } = useAds();
  const { user, authtrue } = useAuth();
  const { categories, locations } = useDictionaries();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({
    title: '',
    images: [],
    description: '',
    price: '',
    categoryId: '',
    location: '',
    phone: '',
  });

  const [previewIndex, setPreviewIndex] = useState(0);
  const [loading, setLoading] = useState(isEdit);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const effectiveCategoryId = form.categoryId || categories[0]?.value || '';
  const effectiveLocation = form.location || locations[0]?.value || '';

  useEffect(() => {
    if (!isEdit || !id) {
      return;
    }

    let cancelled = false;

    getAd(id)
      .then((ad) => {
        if (cancelled) return;

        if (user?.username && ad.authorId !== user.username) {
          setError('Вы не можете редактировать чужое объявление.');
          return;
        }

        setError(null);
        setForm({
          title: ad.title,
          images: ad.images || [],
          description: ad.description,
          price: String(ad.price),
          categoryId: ad.categoryId,
          location: ad.location,
          phone: ad.phone,
        });
      })
      .catch((requestError) => {
        if (!cancelled) {
          setError(
            getApiErrorMessage(requestError, 'Объявление не найдено.'),
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, isEdit, getAd, user?.username]);

  const update = (key: keyof FormState, value: string | string[]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (form.images.length + files.length > 15) {
      toast.error('Максимум 15 фотографий');
      e.target.value = '';
      return;
    }

    if (!authtrue) {
      toast.error('Войдите, чтобы загрузить фотографии');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      const uploadedIds: string[] = [];

      for (const file of Array.from(files)) {
        const preparedFile = await prepareImageFile(file);
        const imageId = await uploadImage(preparedFile);
        uploadedIds.push(imageId);
      }

      setForm((prev) => ({
        ...prev,
        images: [...prev.images, ...uploadedIds],
      }));
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    update('images', newImages);
    if (previewIndex >= newImages.length) {
      setPreviewIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!authtrue || !user?.username) {
      toast.error('Требуется авторизация');
      return;
    }

    if (form.images.length === 0) {
      toast.error('Загрузите хотя бы одну фотографию');
      return;
    }

    if (!effectiveCategoryId || !effectiveLocation) {
      toast.error('Дождитесь загрузки справочников и выберите категорию и город');
      return;
    }

    const payload: CreateAdRequest = {
      title: form.title.trim(),
      images: form.images,
      description: form.description.trim(),
      price: Number(form.price),
      categoryId: effectiveCategoryId,
      location: effectiveLocation,
      phone: form.phone.trim(),
    };

    const successMessage = isEdit
      ? `Объявление "${form.title}" отредактировано и отправлено на модерацию`
      : `Объявление "${form.title}" создано и отправлено на модерацию`;

    setSubmitting(true);
    try {
      if (isEdit && id) {
        await updateAd(id, payload);
      } else {
        await createAd(payload);
      }

      toast.success(successMessage);
      navigate('/myAds');
    } catch (requestError) {
      toast.error(getApiErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="createAd-main-container">
        <p className="createAd-empty">Загрузка объявления...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="createAd-main-container">
        <p className="createAd-empty">{error}</p>
      </div>
    );
  }

  return (
    <div className="createAd-main-container">
      <div className="createAd-header-container">
        <p className="p-createAd">
          {isEdit ? 'Редактировать объявление' : 'Создать объявление'}
        </p>
      </div>

      <form className="createAd-form" onSubmit={handleSubmit}>
        <div className="createAd-photos-block">
          <p className="createAd-section-title">Фотографии</p>
          {form.images.length > 0 && (
            <div className="createAd-main-preview">
              <ImageComponent className="createAd-main-preview-img" src={form.images[previewIndex]} />
            </div>
          )}

          <div className="createAd-mini-img">
            {form.images.map((img, i) => (
              <div key={img} className={`createAd-img ${previewIndex === i ? 'active' : ''}`} onClick={() => setPreviewIndex(i)}>
                <ImageComponent className="createAd-image" src={img} />
                <button type="button" className="createAd-img-delete" onClick={(e) => {e.stopPropagation();removeImage(i);}}>
                  <img src={DELETE_IMG} alt="Удалить" className="delete-icon" />
                </button>
              </div>
            ))}

            {form.images.length < 15 && (
              <label className="createAd-upload-label">
                <span className='createAd-img-span'>+</span>
                <p className='p-createAd-img'>
                  {uploading ? 'Загрузка' : 'Добавить'}
                </p>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} className="createAd-file-input" disabled={uploading} />
              </label>
            )}
          </div>
        </div>

        <label className="createAd-label">Название
          <input className="createAd-input" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required maxLength={30} />
        </label>

        <label className="createAd-label">Описание
          <textarea className="createAd-textarea" value={form.description} onChange={(e) => update('description', e.target.value)} rows={10} maxLength={1000} required />
        </label>

        <label className="createAd-label">Цена, $
          <input className="createAd-input" type="number" value={form.price} onChange={(e) => update('price', e.target.value)} min={0} required />
        </label>

        <label className="createAd-label">Категория
          <select className="createAd-select" value={effectiveCategoryId} onChange={(e) => update('categoryId', e.target.value)} required >
            {categories.map((category) => (
              <option key={category.value} value={category.value}>{category.label}</option>
            ))}
          </select>
        </label>

        <label className="createAd-label">Город
          <select className="createAd-select" value={effectiveLocation} onChange={(e) => update('location', e.target.value)} required >
            {locations.map((location) => (
              <option key={location.value} value={location.value}>{location.label}</option>
            ))}
          </select>
        </label>

        <label className="createAd-label">Телефон
            <input className="createAd-input" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+375 (11) 111-11-11" required/>
        </label>

        <div className="createAd-actions">
          <button type="button" className="createAd-cancel-button" onClick={() => navigate(-1)} >
            Отмена
          </button>
          <button type="submit" className="createAd-submit-button" disabled={submitting || uploading}>
            {submitting ? 'Сохранение...' : isEdit ? 'Сохранить изменения' : 'Опубликовать'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAd;