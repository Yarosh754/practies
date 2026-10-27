import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAds } from '../contexts/AdContext';
import { useAuth } from '../contexts/AuthContext';
import { seedCategories, seedLocations } from '../storage/seedAd';
import './CreateAd.css';
import { toast } from 'sonner';
import { useNotifications } from '../contexts/NotificationsContext';
import { processImageFile } from '../utils/imageUtils';
import type { Ad } from '../types';
import ImageComponent from '../components/ImageComponent';

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

  const { ads, addAd, updateAd } = useAds();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { addNotification } = useNotifications();

  const [form, setForm] = useState<FormState>({
    title: '',
    images: [],
    description: '',
    price: '',
    categoryId: seedCategories[0].value,
    location: seedLocations[1].value,
    phone: '',
  });

  const [previewIndex, setPreviewIndex] = useState(0);

  useEffect(() => {
    if (!isEdit || !id) return;

    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    setForm({
      title: ad.title,
      images: ad.images || [],
      description: ad.description,
      price: String(ad.price),
      categoryId: ad.categoryId,
      location: ad.location,
      phone: ad.phone,
    });
  }, [id, isEdit, ads]);

  if (isEdit && id) {
    const ad = ads.find((a) => a.id === id);
    if (!ad) {
      return (
        <div className="createAd-main-container">
          <p className="createAd-empty">Объявление не найдено.</p>
        </div>
      );
    }

    if (ad.authorId !== user.username) {
      return (
        <div className="createAd-main-container">
          <p className="createAd-empty">Вы не можете редактировать чужое объявление.</p>
        </div>
      );
    }
  }

  const update = (key: keyof FormState, value: any) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (form.images.length + files.length > 15) {
      toast.error('Максимум 15 фотографий');
      return;
    }

    const newImages: string[] = [];
    for (let i = 0; i < files.length; i++) {
      const base64 = await processImageFile(files[i]);
      newImages.push(base64);
    }

    update('images', [...form.images, ...newImages]);
    e.target.value = '';
  };

  const removeImage = (index: number) => {
    const newImages = form.images.filter((_, i) => i !== index);
    update('images', newImages);
    if (previewIndex >= newImages.length) {
      setPreviewIndex(Math.max(0, newImages.length - 1));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (form.images.length === 0) {
      toast.error('Загрузите хотя бы одну фотографию');
      return;
    }

    const createad = {
      title: form.title.trim(),
      images: form.images,
      description: form.description.trim(),
      price: Number(form.price),
      categoryId: form.categoryId,
      location: form.location,
      phone: form.phone.trim(),
      status: 'MODERATION' as const,
      authorId: user.username,
    };

    let createdAd: Ad; 

    if (isEdit && id) {
      updateAd(id, createad);
      createdAd = { ...createad, id, createdAt: '...' }; 
    } else {
      createdAd = addAd(createad);
    }

    const message = isEdit ? `Объявление "${form.title}" отредактировано и отправлено на модерацию` : `Объявление "${form.title}" создано и отправлено на модерацию`;
    toast.success(message);
    addNotification(user.username, message, `/adMain/${createdAd.id}`);

    navigate('/myAds');
  };

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
              <div key={i} className={`createAd-img ${previewIndex === i ? 'active' : ''}`} onClick={() => setPreviewIndex(i)}>
                <ImageComponent className="createAd-image" src={img} />
                <button type="button" className="createAd-img-delete" onClick={(e) => { e.stopPropagation(); removeImage(i); }}>
                  <img src={DELETE_IMG} alt="Удалить" className="delete-icon" />
                </button>
              </div>
            ))}
            
            {form.images.length < 15 && (
              <label className="createAd-upload-label">
                <span className='createAd-img-span'>+</span>
                <p className='p-createAd-img'>Добавить</p>
                <input type="file" accept="image/*" multiple onChange={handleImageUpload} style={{ display: 'none' }} />
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
          <select className="createAd-select" value={form.categoryId} onChange={(e) => update('categoryId', e.target.value)} required >
            {seedCategories.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
          </select>
        </label>

        <label className="createAd-label">Город
          <select className="createAd-select" value={form.location} onChange={(e) => update('location', e.target.value)} required >
            {seedLocations.filter((l) => l.value !== '').map((l) => (
              <option key={l.value} value={l.value}>{l.label}</option>
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
          <button type="submit" className="createAd-submit-button">
            {isEdit ? 'Сохранить изменения' : 'Опубликовать'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default CreateAd;