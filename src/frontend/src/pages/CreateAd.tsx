import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAds } from '../contexts/AdContext';
import { useAuth } from '../contexts/AuthContext';
import { seedCategories, seedLocations } from '../storage/seedAd';
import './CreateAd.css';
import { toast } from 'sonner';
import { useNotifications } from '../contexts/NotificationsContext';

interface FormState {
  title: string;
  image: string;
  description: string;
  price: string;
  categoryId: string;
  location: string;
  phone: string;
}

function CreateAd() {
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);

  const { ads, addAd, updateAd } = useAds();
  const { user } = useAuth();
  const navigate = useNavigate();

  const { addNotification } = useNotifications();

  const [form, setForm] = useState<FormState>({
    title: '',
    image: '',
    description: '',
    price: '',
    categoryId: seedCategories[0].value,
    location: seedLocations[1].value,
    phone: '',
  });

  useEffect(() => {
    if (!isEdit || !id) return;

    const ad = ads.find((a) => a.id === id);
    if (!ad) return;

    setForm({
      title: ad.title,
      image: ad.image,
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

  const update = (key: keyof FormState, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const createad = {
      title: form.title.trim(),
      image: form.image.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      categoryId: form.categoryId,
      location: form.location,
      phone: form.phone.trim(),
      status: 'MODERATION' as const,
      authorId: user.username,
    };

    if (isEdit && id) {
      updateAd(id, createad);
    } else {
      addAd(createad);
    }

    const message = isEdit ? 'Объявление отредактировано и отправлено на модерацию' : 'Объявление создано и отправлено на модерацию';
    toast.success(message);
    addNotification(user.username, message);

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
        <label className="createAd-label">Название
          <input className="createAd-input" type="text" value={form.title} onChange={(e) => update('title', e.target.value)} required maxLength={30} />
        </label>

        <label className="createAd-label">Ссылка на фото
          <input className="createAd-input" type="url" value={form.image} onChange={(e) => update('image', e.target.value)} />
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