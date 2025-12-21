import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { storage, db } from '../config/firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

interface Photo {
  id: string
  url: string
  caption: string
  uploadedBy: string
  uploadedAt: Timestamp
  storagePath: string
  reactions?: Record<string, string[]> // { emoji: [user1, user2, ...] }
}

export const FamilyPictures: React.FC = () => {
  const [photos, setPhotos] = useState<Photo[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [caption, setCaption] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [editingCaption, setEditingCaption] = useState<string | null>(null)
  const [editedCaptionText, setEditedCaptionText] = useState('')
  const [hoveredPhotoId, setHoveredPhotoId] = useState<string | null>(null)
  const emojiOptions = [
    '❤️', // Heart
    '😂', // Laugh
    '😍', // Love eyes
    '👍', // Thumbs up
    '🎉', // Party popper
    '🙏', // Praying hands
    '😢', // Crying
    '😮', // Surprised
    '🎂', // Birthday cake
    '🥳', // Celebration face
    '🪩', // Disco ball (party/celebration)
    '🎆', // Fireworks (New Year)
    '🎇', // Sparkler (New Year)
    '💍', // Ring (Anniversary)
    '💐', // Bouquet (Anniversary/Celebration)
    '👩‍❤️‍👨', // Couple (Anniversary)
    '👨‍👩‍👧‍👦', // Family
  ]
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user: currentUser } = useAuth()

  // Load photos from Firestore
  useEffect(() => {
    loadPhotos()
  }, [])

  const loadPhotos = async () => {
    try {
      const photosQuery = query(collection(db, 'familyPhotos'), orderBy('uploadedAt', 'desc'))
      const querySnapshot = await getDocs(photosQuery)
      const photosData: Photo[] = []
      querySnapshot.forEach((docSnap) => {
        const data = docSnap.data()
        photosData.push({
          id: docSnap.id,
          ...data,
          reactions: data.reactions || {},
        } as Photo)
      })
      setPhotos(photosData)
    } catch (error) {
      console.error('Error loading photos:', error)
    } finally {
      setLoading(false)
    }
  }
  // Add or remove emoji reaction for a photo
  const handleEmojiReaction = async (photo: Photo, emoji: string) => {
    if (!currentUser) return
    const user = currentUser.email
    if (!user) return
    const reactions = { ...(photo.reactions || {}) }
    const users = new Set(reactions[emoji] || [])
    if (users.has(user)) {
      users.delete(user)
    } else {
      users.add(user)
    }
    reactions[emoji] = Array.from(users)
    // Remove emoji if no users left
    if (reactions[emoji].length === 0) delete reactions[emoji]
    try {
      await updateDoc(doc(db, 'familyPhotos', photo.id), { reactions })
      setPhotos((prev) => prev.map((p) =>
        p.id === photo.id ? { ...p, reactions } : p
      ))
    } catch (error) {
      alert('Failed to update emoji reaction')
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0) return
    const file = files[0]
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    uploadPhoto(file)
  }

  const uploadPhoto = async (file: File) => {
    if (!currentUser) return

    setUploading(true)
    setUploadProgress(0)

    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `family-photos/${filename}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      },
      (error) => {
        console.error('Upload error:', error)
        alert(`Failed to upload photo: ${error.message}\n\nPlease check:\n1. Firebase Storage is enabled\n2. Storage rules allow uploads\n3. Firestore is enabled`)
        setUploading(false)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          
          await addDoc(collection(db, 'familyPhotos'), {
            url: downloadURL,
            caption: caption || 'Untitled',
            uploadedBy: currentUser.email,
            uploadedAt: Timestamp.now(),
            storagePath: `family-photos/${filename}`
          })

          setCaption('')
          setUploading(false)
          setUploadProgress(0)
          loadPhotos()
          alert('Photo uploaded successfully!')
        } catch (error) {
          console.error('Firestore error:', error)
          alert(`Failed to save photo metadata: ${error instanceof Error ? error.message : 'Unknown error'}\n\nThe photo was uploaded but metadata could not be saved.`)
          setUploading(false)
        }
      }
    )
  }

  const deletePhoto = async (photo: Photo) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
      // Delete from Storage
      const storageRef = ref(storage, photo.storagePath);
      await deleteObject(storageRef)
        .catch((error) => {
          // If file not found, log and continue
          if (error.code === 'storage/object-not-found') {
            console.warn('Photo file not found in storage, removing Firestore reference anyway.');
          } else {
            throw error;
          }
        });

      // Delete from Firestore
      await deleteDoc(doc(db, 'familyPhotos', photo.id));

      setPhotos(photos.filter(p => p.id !== photo.id));
      setSelectedPhoto(null);
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  }

  const startEditCaption = (photo: Photo) => {
    setEditingCaption(photo.id)
    setEditedCaptionText(photo.caption)
  }

  const saveCaption = async (photoId: string) => {
    try {
      await updateDoc(doc(db, 'familyPhotos', photoId), {
        caption: editedCaptionText || 'Untitled'
      })

      setPhotos(photos.map(p => 
        p.id === photoId ? { ...p, caption: editedCaptionText || 'Untitled' } : p
      ))
      
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto({ ...selectedPhoto, caption: editedCaptionText || 'Untitled' })
      }

      setEditingCaption(null)
      setEditedCaptionText('')
    } catch (error) {
      console.error('Error updating caption:', error)
      alert('Failed to update caption. Please try again.')
    }
  }

  const cancelEdit = () => {
    setEditingCaption(null)
    setEditedCaptionText('')
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold mb-3 transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>
            ← Back to Dashboard
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-4xl">📸</span>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600" style={{fontFamily: 'Poppins, sans-serif'}}>
              Family Pictures
            </h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Upload Section */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-100 p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
            Upload New Photo
          </h2>
          
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
              Caption (optional)
            </label>
            <input
              type="text"
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption for your photo..."
              className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
              style={{fontFamily: 'Poppins, sans-serif'}}
              disabled={uploading}
            />
          </div>

          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? 'border-amber-500 bg-amber-50'
                : 'border-gray-300 hover:border-amber-400'
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => handleFileSelect(e.target.files)}
              className="hidden"
              disabled={uploading}
            />
            
            {uploading ? (
              <div className="space-y-3">
                <div className="text-amber-600 font-semibold" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Uploading... {Math.round(uploadProgress)}%
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-amber-500 to-rose-500 h-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            ) : (
              <>
                <div className="text-4xl mb-3">📤</div>
                <p className="text-gray-600 mb-2 font-medium" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Drag and drop your photo here
                </p>
                <p className="text-gray-500 mb-4 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                  or
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  Choose File
                </button>
              </>
            )}
          </div>
        </div>

        {/* Photos Grid */}
        <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-100 p-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>
            Photo Gallery ({photos.length})
          </h2>
          
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
              <p className="mt-4 text-gray-600" style={{fontFamily: 'Poppins, sans-serif'}}>Loading photos...</p>
            </div>
          ) : photos.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📷</div>
              <p className="text-gray-600 text-lg" style={{fontFamily: 'Poppins, sans-serif'}}>
                No photos yet. Upload your first family photo!
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {photos.map((photo) => {
                const reactions = photo.reactions || {}
                return (
                  <div
                    key={photo.id}
                    className="group relative bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:scale-105 cursor-pointer border border-amber-100"
                    onClick={() => setSelectedPhoto(photo)}
                    onMouseEnter={() => setHoveredPhotoId(photo.id)}
                    onMouseLeave={() => setHoveredPhotoId((id) => (id === photo.id ? null : id))}
                  >
                    <div className="aspect-square overflow-hidden relative">
                      <img
                        src={photo.url}
                        alt={photo.caption}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                      />
                      {/* Emoji reactions display (bottom right) */}
                      <div className="absolute bottom-2 right-2 flex flex-wrap gap-1 z-10">
                        {Object.entries(reactions).map(([emoji, users]) => {
                          const tooltip = users.length === 1
                            ? users[0]
                            : users.join(', ')
                          return (
                            <span
                              key={emoji}
                              className="bg-white/80 rounded-full px-2 py-1 text-lg shadow border border-amber-200 flex items-center gap-1 select-none"
                              style={{fontFamily: 'Poppins, sans-serif'}}
                              title={tooltip}
                            >
                              {emoji} <span className="text-xs font-bold">{users.length}</span>
                            </span>
                          )
                        })}
                      </div>
                      {/* Emoji menu on hover - top left */}
                      {hoveredPhotoId === photo.id && (
                        <div
                          className="absolute top-2 left-2 flex gap-2 bg-white/90 rounded-xl shadow-lg px-3 py-2 z-20 animate-fade-in"
                          style={{
                            maxWidth: '90%',
                            overflowX: 'auto',
                            whiteSpace: 'nowrap',
                            scrollbarWidth: 'thin',
                          }}
                        >
                          {emojiOptions.map((emoji) => {
                            const user = currentUser?.email
                            const selected = user && (reactions[emoji]?.includes(user))
                            return (
                              <button
                                key={emoji}
                                className={`text-2xl transition-transform hover:scale-125 inline-block ${selected ? 'ring-2 ring-amber-400' : ''}`}
                                style={{ minWidth: 40 }}
                                onClick={e => {
                                  e.stopPropagation()
                                  handleEmojiReaction(photo, emoji)
                                }}
                                title={emoji}
                              >
                                {emoji}
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                    <div className="p-3">
                      {editingCaption === photo.id ? (
                        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                          <input
                            type="text"
                            value={editedCaptionText}
                            onChange={(e) => setEditedCaptionText(e.target.value)}
                            className="flex-1 text-sm px-2 py-1 border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                            style={{fontFamily: 'Poppins, sans-serif'}}
                            autoFocus
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') saveCaption(photo.id)
                              if (e.key === 'Escape') cancelEdit()
                            }}
                          />
                          <button
                            onClick={() => saveCaption(photo.id)}
                            className="text-green-600 hover:text-green-700 px-2"
                            title="Save"
                          >
                            ✓
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="text-red-600 hover:text-red-700 px-2"
                            title="Cancel"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-semibold text-gray-800 truncate flex-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                            {photo.caption}
                          </p>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              startEditCaption(photo)
                            }}
                            className="text-amber-600 hover:text-amber-700 text-xs"
                            title="Edit caption"
                          >
                            ✏️
                          </button>
                        </div>
                      )}
                      <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                        {photo.uploadedAt.toDate().toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      {/* Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 overflow-auto"
          onClick={() => setSelectedPhoto(null)}
        >
          <div
            className="relative w-full max-w-6xl my-8 bg-white rounded-2xl shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedPhoto(null)}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 hover:bg-white rounded-full flex items-center justify-center text-gray-800 font-bold text-xl shadow-lg z-10 transition-all"
            >
              ×
            </button>
            
            <div className="w-full flex items-center justify-center bg-gray-100 p-4 min-h-[300px] max-h-[60vh] overflow-hidden">
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption}
                className="max-w-full max-h-[60vh] w-auto h-auto object-contain"
              />
            </div>
            
            <div className="p-6 bg-white">
              {editingCaption === selectedPhoto.id ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={editedCaptionText}
                    onChange={(e) => setEditedCaptionText(e.target.value)}
                    className="w-full text-2xl font-bold px-3 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    style={{fontFamily: 'Poppins, sans-serif'}}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') saveCaption(selectedPhoto.id)
                      if (e.key === 'Escape') cancelEdit()
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => saveCaption(selectedPhoto.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                    >
                      ✓ Save
                    </button>
                    <button
                      onClick={cancelEdit}
                      className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                    >
                      ✕ Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-start justify-between mb-2">
                  <h3 className="text-2xl font-bold text-gray-800" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {selectedPhoto.caption}
                  </h3>
                  <button
                    onClick={() => startEditCaption(selectedPhoto)}
                    className="px-3 py-1 text-amber-600 hover:text-amber-700 hover:bg-amber-50 rounded transition-colors"
                    title="Edit caption"
                  >
                    ✏️ Edit
                  </button>
                </div>
              )}
              <p className="text-gray-600 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
                Uploaded by {selectedPhoto.uploadedBy} on{' '}
                {selectedPhoto.uploadedAt.toDate().toLocaleDateString()}
              </p>
              <button
                onClick={() => deletePhoto(selectedPhoto)}
                className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                🗑️ Delete Photo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}