import { useState, useEffect } from 'react';
import { useAuthStore } from '../stores/authStore.js';
import { materialService } from '../services/material.service.js';
import type { Material } from '../types/index.js';
import {
    Plus,
    ExternalLink,
    Trash2,
    Edit3,
    X,
    Save,
    Film,
    FileText,
    Newspaper,
    Check
} from 'lucide-react';

export const MaterialsPage = () => {
    const { profile, isTeacher } = useAuthStore();
    const [materials, setMaterials] = useState<Material[]>([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    // Форма
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [coverUrl, setCoverUrl] = useState('');
    const [link, setLink] = useState('');
    const [type, setType] = useState<'article' | 'video'>('article');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadMaterials();
    }, []);

    const loadMaterials = async () => {
        try {
            setLoading(true);
            const data = await materialService.getAll();
            setMaterials(data);
        } catch (error) {
            console.error('Ошибка загрузки материалов:', error);
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setTitle('');
        setDescription('');
        setCoverUrl('');
        setLink('');
        setType('article');
        setEditingId(null);
    };

    const startCreate = () => {
        resetForm();
        setShowForm(true);
    };

    const startEdit = (material: Material) => {
        setEditingId(material.id);
        setTitle(material.title);
        setDescription(material.description);
        setCoverUrl(material.coverUrl);
        setLink(material.link);
        setType(material.type);
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    console.log('=== DEBUG ===');
    console.log('profile:', profile);
    console.log('profile?.uid:', profile?.uid);
    console.log('isTeacher():', isTeacher());
    console.log('materials count:', materials.length);
    materials.forEach(m => {
        console.log('material:', m.title, 'authorId:', m.authorId);
    });



    const handleSave = async () => {
        if (!title || !link) return;

        setSaving(true);
        try {
            if (editingId) {
                await materialService.update(editingId, {
                    title,
                    description,
                    coverUrl,
                    link,
                    type
                });
            } else {
                await materialService.create({
                    title,
                    description,
                    coverUrl,
                    link,
                    type
                });
            }
            await loadMaterials();
            resetForm();
            setShowForm(false);
        } catch (error) {
            console.error('Ошибка сохранения:', error);
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Удалить этот материал?')) return;

        try {
            await materialService.delete(id);
            setMaterials(materials.filter(m => m.id !== id));
        } catch (error) {
            console.error('Ошибка удаления:', error);
        }
    };

    const cancelForm = () => {
        setShowForm(false);
        resetForm();
    };

    const getTypeIcon = (materialType: string) => {
        switch (materialType) {
            case 'video': return <Film className="w-5 h-5 text-red-400" />;
            case 'article': return <FileText className="w-5 h-5 text-blue-400" />;
            default: return <FileText className="w-5 h-5 text-blue-400" />;
        }
    };

    const getTypeLabel = (materialType: string) => {
        switch (materialType) {
            case 'video': return 'Видео';
            case 'article': return 'Статья';
            default: return 'Статья';
        }
    };

    const getTypeColor = (materialType: string) => {
        switch (materialType) {
            case 'video': return 'bg-red-500/80 text-white';
            case 'article': return 'bg-blue-500/80 text-white';
            default: return 'bg-blue-500/80 text-white';
        }
    };

    const isYouTube = (url: string) => {
        return url.includes('youtube.com') || url.includes('youtu.be');
    };

    const getYouTubeThumbnail = (url: string) => {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\s]+)/);
        return match ? `https://img.youtube.com/vi/${match[1]}/mqdefault.jpg` : '';
    };

    const canEdit = (material: Material) => {
        return isTeacher() && profile && material.authorId === profile.uid;
    };

    return (
        <div className="min-h-screen bg-slate-900 text-white">
            {/* Фон */}
            <div className="fixed inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pointer-events-none" />
            <div className="fixed inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/10 via-transparent to-transparent pointer-events-none" />

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Шапка */}
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/20">
                                <Newspaper className="w-5 h-5 text-white" />
                            </div>
                            <h1 className="text-3xl font-bold text-white tracking-tight">
                                Материалы
                            </h1>
                        </div>
                        <p className="text-slate-400 text-base">
                            Полезные статьи и видео по астрономии
                        </p>
                    </div>

                    {isTeacher() && (
                        <button
                            onClick={startCreate}
                            className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-500 active:bg-blue-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 hover:-translate-y-0.5"
                        >
                            <Plus className="w-5 h-5" />
                            Добавить материал
                        </button>
                    )}
                </div>

                {/* Форма добавления/редактирования */}
                {showForm && isTeacher() && (
                    <div className="mb-10 bg-slate-800/90 backdrop-blur-xl rounded-2xl border border-slate-700 shadow-2xl overflow-hidden animate-in slide-in-from-top-4">
                        <div className="px-6 py-4 border-b border-slate-700/50 flex items-center justify-between bg-slate-800/50">
                            <h2 className="text-lg font-bold text-white">
                                {editingId ? 'Редактировать материал' : 'Новый материал'}
                            </h2>
                            <button
                                onClick={cancelForm}
                                className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-lg transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Название *</label>
                                    <input
                                        type="text"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        placeholder="Например: Чёрные дыры — объяснение за 5 минут"
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Тип</label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setType('article')}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${type === 'article'
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20'
                                                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                                }`}
                                        >
                                            <FileText className="w-4 h-4" />
                                            Статья
                                        </button>
                                        <button
                                            onClick={() => setType('video')}
                                            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-all ${type === 'video'
                                                ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                                                : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700 hover:text-white'
                                                }`}
                                        >
                                            <Film className="w-4 h-4" />
                                            Видео
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Ссылка *</label>
                                    <input
                                        type="url"
                                        value={link}
                                        onChange={(e) => setLink(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">Описание</label>
                                    <textarea
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        placeholder="Краткое описание материала..."
                                        rows={3}
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-slate-300 mb-2">URL обложки</label>
                                    <input
                                        type="url"
                                        value={coverUrl}
                                        onChange={(e) => setCoverUrl(e.target.value)}
                                        placeholder="https://example.com/image.jpg (или оставьте пустым для авто)"
                                        className="w-full px-4 py-3 bg-slate-900/80 border border-slate-600 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                                    />
                                    {type === 'video' && isYouTube(link) && !coverUrl && (
                                        <p className="text-xs text-blue-400 mt-1.5">
                                            Для YouTube обложка подставится автоматически
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <div className="px-6 py-4 border-t border-slate-700/50 flex justify-end gap-3">
                            <button
                                onClick={cancelForm}
                                className="px-5 py-2.5 bg-slate-700 hover:bg-slate-600 text-white font-semibold rounded-xl transition-all"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={saving || !title || !link}
                                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 disabled:from-slate-700 disabled:to-slate-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-600/20 disabled:shadow-none"
                            >
                                <Save className="w-5 h-5" />
                                {saving ? 'Сохранение...' : (editingId ? 'Сохранить' : 'Добавить')}
                            </button>
                        </div>
                    </div>
                )}

                {/* Список материалов */}
                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-10 h-10 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
                    </div>
                ) : materials.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-slate-800/40 rounded-2xl border border-slate-700/50 border-dashed">
                        <Newspaper className="w-16 h-16 text-slate-600 mb-4" />
                        <h3 className="text-xl font-bold text-slate-400 mb-2">Пока нет материалов</h3>
                        <p className="text-slate-500 text-center max-w-md">
                            {isTeacher()
                                ? 'Добавьте первый материал, нажав кнопку выше'
                                : 'Преподаватель пока не добавил материалы'}
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {materials.map((material) => {
                            const thumbnail = material.coverUrl || (isYouTube(material.link) ? getYouTubeThumbnail(material.link) : '');

                            return (
                                <div
                                    key={material.id}
                                    className="group bg-slate-800/80 rounded-2xl border border-slate-700/50 overflow-hidden hover:border-slate-600 transition-all hover:shadow-xl hover:shadow-blue-500/5 hover:-translate-y-1 flex flex-col"
                                >
                                    {/* Обложка */}
                                    <a
                                        href={material.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block relative aspect-video bg-slate-900 overflow-hidden flex-shrink-0"
                                    >
                                        {thumbnail ? (
                                            <img
                                                src={thumbnail}
                                                alt={material.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                onError={(e) => {
                                                    (e.target as HTMLImageElement).style.display = 'none';
                                                }}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-slate-800 to-slate-900">
                                                {getTypeIcon(material.type)}
                                            </div>
                                        )}

                                        {/* Бейдж типа */}
                                        <div className="absolute top-3 left-3">
                                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold backdrop-blur ${getTypeColor(material.type)}`}>
                                                {getTypeIcon(material.type)}
                                                {getTypeLabel(material.type)}
                                            </span>
                                        </div>

                                        {/* Иконка внешней ссылки */}
                                        <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="w-8 h-8 rounded-lg bg-black/50 backdrop-blur flex items-center justify-center">
                                                <ExternalLink className="w-4 h-4 text-white" />
                                            </div>
                                        </div>

                                        {/* Play для видео */}
                                        {material.type === 'video' && (
                                            <div className="absolute inset-0 flex items-center justify-center">
                                                <div className="w-14 h-14 rounded-full bg-white/20 backdrop-blur flex items-center justify-center group-hover:bg-white/30 transition-colors">
                                                    <Film className="w-6 h-6 text-white" />
                                                </div>
                                            </div>
                                        )}
                                    </a>

                                    {/* Контент */}
                                    <div className="p-4 flex flex-col flex-grow">
                                        <a
                                            href={material.link}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block group/link mb-2"
                                        >
                                            <h3 className="font-bold text-white text-base leading-snug group-hover/link:text-blue-400 transition-colors">
                                                {material.title}
                                            </h3>
                                        </a>

                                        {material.description && (
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-3">
                                                {material.description}
                                            </p>
                                        )}

                                        {/* Кнопки управления (только для автора) */}
                                        <div className="mt-auto pt-3 border-t border-slate-700/50 flex items-center justify-between">
                                            <span className="text-xs text-slate-500">
                                                {material.authorName}
                                            </span>

                                            {canEdit(material) && (
                                                <div className="flex gap-1">
                                                    <button
                                                        onClick={() => startEdit(material)}
                                                        className="p-1.5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10 rounded-lg transition-colors"
                                                        title="Редактировать"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(material.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                                                        title="Удалить"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
};