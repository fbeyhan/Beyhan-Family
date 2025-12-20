import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { storage, db } from '../config/firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp, updateDoc, where } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

interface Trip {
  id: string
  title: string
  location: string
  emoji: string
  startDate?: Timestamp
  endDate?: Timestamp
  description?: string
  createdAt: Timestamp
  createdBy: string
}

interface TripPhoto {
  id: string
  tripId: string
  url: string
  caption: string
  uploadedBy: string
  uploadedAt: Timestamp
  storagePath: string
}

export const Trips: React.FC = () => {
  const [trips, setTrips] = useState<Trip[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedTrip, setSelectedTrip] = useState<Trip | null>(null)
  const [tripPhotos, setTripPhotos] = useState<TripPhoto[]>([])
  const [loadingPhotos, setLoadingPhotos] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [photoCaption, setPhotoCaption] = useState('')
  const [selectedPhoto, setSelectedPhoto] = useState<TripPhoto | null>(null)
  const [dragActive, setDragActive] = useState(false)
  const [showAddTrip, setShowAddTrip] = useState(false)
  const [editingTrip, setEditingTrip] = useState<Trip | null>(null)
  const [editingPhoto, setEditingPhoto] = useState<string | null>(null)
  const [editedPhotoCaption, setEditedPhotoCaption] = useState('')
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user: currentUser } = useAuth()

  // Form states for adding/editing trips
  const [tripForm, setTripForm] = useState({
    title: '',
    location: '',
    emoji: '✈️',
    startDate: '',
    endDate: '',
    description: ''
  })

  useEffect(() => {
    loadTrips()
  }, [])

  const loadTrips = async () => {
    try {
      const tripsQuery = query(collection(db, 'familyTrips'), orderBy('createdAt', 'desc'))
      const querySnapshot = await getDocs(tripsQuery)
      const tripsData: Trip[] = []
      querySnapshot.forEach((doc) => {
        tripsData.push({ id: doc.id, ...doc.data() } as Trip)
      })
      setTrips(tripsData)
    } catch (error) {
      console.error('Error loading trips:', error)
    } finally {
      setLoading(false)
    }
  }

  const loadTripPhotos = async (tripId: string) => {
    setLoadingPhotos(true)
    try {
      const photosQuery = query(
        collection(db, 'tripPhotos'),
        where('tripId', '==', tripId)
      )
      const querySnapshot = await getDocs(photosQuery)
      const photosData: TripPhoto[] = []
      querySnapshot.forEach((doc) => {
        photosData.push({ id: doc.id, ...doc.data() } as TripPhoto)
      })
      // Sort by uploadedAt on client side to avoid needing a composite index
      photosData.sort((a, b) => b.uploadedAt.toMillis() - a.uploadedAt.toMillis())
      setTripPhotos(photosData)
      console.log(`Loaded ${photosData.length} photos for trip ${tripId}`)
    } catch (error: any) {
      console.error('Error loading trip photos:', error)
      console.error('Error code:', error.code)
      alert(`Error loading photos: ${error.message}`)
    } finally {
      setLoadingPhotos(false)
    }
  }

  const handleTripClick = (trip: Trip) => {
    setSelectedTrip(trip)
    loadTripPhotos(trip.id)
  }

  const handleAddTrip = async () => {
    if (!currentUser || !tripForm.title || !tripForm.location) {
      alert('Please fill in title and location')
      return
    }

    try {
      const tripData: any = {
        title: tripForm.title,
        location: tripForm.location,
        emoji: tripForm.emoji || '✈️',
        description: tripForm.description || '',
        createdAt: Timestamp.now(),
        createdBy: currentUser.email
      }

      if (tripForm.startDate) {
        // Store date without timezone conversion
        const [year, month, day] = tripForm.startDate.split('-').map(Number)
        tripData.startDate = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }
      if (tripForm.endDate) {
        // Store date without timezone conversion
        const [year, month, day] = tripForm.endDate.split('-').map(Number)
        tripData.endDate = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }

      console.log('Attempting to add trip with data:', tripData)
      await addDoc(collection(db, 'familyTrips'), tripData)
      
      setTripForm({
        title: '',
        location: '',
        emoji: '✈️',
        startDate: '',
        endDate: '',
        description: ''
      })
      setShowAddTrip(false)
      loadTrips()
      alert('Trip added successfully!')
    } catch (error: any) {
      console.error('Error adding trip:', error)
      console.error('Error code:', error.code)
      console.error('Error message:', error.message)
      alert(`Failed to add trip: ${error.message}\n\nError code: ${error.code}\n\nPlease check:\n1. Firestore is enabled in Firebase Console\n2. Firestore security rules allow writes\n3. Internet connection is working`)
    }
  }

  const handleUpdateTrip = async () => {
    if (!editingTrip || !tripForm.title || !tripForm.location) {
      alert('Please fill in title and location')
      return
    }

    try {
      const updateData: any = {
        title: tripForm.title,
        location: tripForm.location,
        emoji: tripForm.emoji || '✈️',
        description: tripForm.description || ''
      }

      if (tripForm.startDate) {
        // Store date without timezone conversion
        const [year, month, day] = tripForm.startDate.split('-').map(Number)
        updateData.startDate = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }
      if (tripForm.endDate) {
        // Store date without timezone conversion
        const [year, month, day] = tripForm.endDate.split('-').map(Number)
        updateData.endDate = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }

      await updateDoc(doc(db, 'familyTrips', editingTrip.id), updateData)
      
      setEditingTrip(null)
      setTripForm({
        title: '',
        location: '',
        emoji: '✈️',
        startDate: '',
        endDate: '',
        description: ''
      })
      loadTrips()
      alert('Trip updated successfully!')
    } catch (error) {
      console.error('Error updating trip:', error)
      alert('Failed to update trip. Please try again.')
    }
  }

  const handleEditTrip = (trip: Trip) => {
    setEditingTrip(trip)
    setTripForm({
      title: trip.title,
      location: trip.location,
      emoji: trip.emoji,
      startDate: trip.startDate ? (() => {
        const date = trip.startDate.toDate()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })() : '',
      endDate: trip.endDate ? (() => {
        const date = trip.endDate.toDate()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })() : '',
      description: trip.description || ''
    })
    setShowAddTrip(false)
  }

  const handleDeleteTrip = async (trip: Trip) => {
    if (!window.confirm(`Are you sure you want to delete "${trip.title}"? This will also delete all photos associated with this trip.`)) return

    try {
      // Delete all photos for this trip
      const photosQuery = query(collection(db, 'tripPhotos'), where('tripId', '==', trip.id))
      const photosSnapshot = await getDocs(photosQuery)
      
      for (const photoDoc of photosSnapshot.docs) {
        const photoData = photoDoc.data() as TripPhoto
        const storageRef = ref(storage, photoData.storagePath)
        await deleteObject(storageRef)
        await deleteDoc(doc(db, 'tripPhotos', photoDoc.id))
      }

      // Delete the trip
      await deleteDoc(doc(db, 'familyTrips', trip.id))
      
      setTrips(trips.filter(t => t.id !== trip.id))
      if (selectedTrip?.id === trip.id) {
        setSelectedTrip(null)
      }
      alert('Trip deleted successfully!')
    } catch (error) {
      console.error('Error deleting trip:', error)
      alert('Failed to delete trip. Please try again.')
    }
  }

  const handleFileSelect = (files: FileList | null) => {
    if (!files || files.length === 0 || !selectedTrip) return
    const file = files[0]
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    uploadPhoto(file)
  }

  const uploadPhoto = async (file: File) => {
    if (!currentUser || !selectedTrip) return

    setUploading(true)
    setUploadProgress(0)

    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `trip-photos/${selectedTrip.id}/${filename}`)
    const uploadTask = uploadBytesResumable(storageRef, file)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      },
      (error) => {
        console.error('Upload error:', error)
        alert(`Failed to upload photo: ${error.message}`)
        setUploading(false)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          
          const newPhotoDoc = await addDoc(collection(db, 'tripPhotos'), {
            tripId: selectedTrip.id,
            url: downloadURL,
            caption: photoCaption || 'Untitled',
            uploadedBy: currentUser.email,
            uploadedAt: Timestamp.now(),
            storagePath: `trip-photos/${selectedTrip.id}/${filename}`
          })

          console.log('Photo document created with ID:', newPhotoDoc.id)
          
          setPhotoCaption('')
          setUploading(false)
          setUploadProgress(0)
          
          // Reload photos after successful upload
          await loadTripPhotos(selectedTrip.id)
          alert('Photo uploaded successfully!')
        } catch (error: any) {
          console.error('Firestore error:', error)
          console.error('Error code:', error.code)
          alert(`Failed to save photo metadata: ${error.message}`)
          setUploading(false)
        }
      }
    )
  }

  const deletePhoto = async (photo: TripPhoto) => {
    if (!window.confirm('Are you sure you want to delete this photo?')) return;

    try {
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
      await deleteDoc(doc(db, 'tripPhotos', photo.id));

      setTripPhotos(tripPhotos.filter(p => p.id !== photo.id));
      setSelectedPhoto(null);
      alert('Photo deleted successfully!');
    } catch (error) {
      console.error('Error deleting photo:', error);
      alert('Failed to delete photo. Please try again.');
    }
  }

  const startEditPhotoCaption = (photo: TripPhoto) => {
    setEditingPhoto(photo.id)
    setEditedPhotoCaption(photo.caption)
  }

  const savePhotoCaption = async (photoId: string) => {
    try {
      await updateDoc(doc(db, 'tripPhotos', photoId), {
        caption: editedPhotoCaption || 'Untitled'
      })

      setTripPhotos(tripPhotos.map(p => 
        p.id === photoId ? { ...p, caption: editedPhotoCaption || 'Untitled' } : p
      ))
      
      if (selectedPhoto?.id === photoId) {
        setSelectedPhoto({ ...selectedPhoto, caption: editedPhotoCaption || 'Untitled' })
      }

      setEditingPhoto(null)
      setEditedPhotoCaption('')
    } catch (error) {
      console.error('Error updating caption:', error)
      alert('Failed to update caption. Please try again.')
    }
  }

  const cancelPhotoEdit = () => {
    setEditingPhoto(null)
    setEditedPhotoCaption('')
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

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return ''
    return timestamp.toDate().toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-rose-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-amber-100">
        <div className="max-w-6xl mx-auto px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center text-amber-600 hover:text-amber-700 font-semibold mb-3 transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>
            ← Back to Dashboard
          </Link>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">✈️</span>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-600 to-rose-600" style={{fontFamily: 'Poppins, sans-serif'}}>
                Family Trips
              </h1>
            </div>
            <button
              onClick={() => {
                setShowAddTrip(!showAddTrip)
                setEditingTrip(null)
                setTripForm({
                  title: '',
                  location: '',
                  emoji: '✈️',
                  startDate: '',
                  endDate: '',
                  description: ''
                })
              }}
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 transform hover:scale-105"
              style={{fontFamily: 'Poppins, sans-serif'}}
            >
              + Add New Trip
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-6 py-12">
        {/* Add/Edit Trip Form */}
        {(showAddTrip || editingTrip) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>
              {editingTrip ? 'Edit Trip' : 'Add New Trip'}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Trip Title *
                </label>
                <input
                  type="text"
                  value={tripForm.title}
                  onChange={(e) => setTripForm({ ...tripForm, title: e.target.value })}
                  placeholder="e.g., Summer Vacation 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Location *
                </label>
                <input
                  type="text"
                  value={tripForm.location}
                  onChange={(e) => setTripForm({ ...tripForm, location: e.target.value })}
                  placeholder="e.g., Paris, France"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Emoji
                </label>
                <input
                  type="text"
                  value={tripForm.emoji}
                  onChange={(e) => setTripForm({ ...tripForm, emoji: e.target.value })}
                  placeholder="✈️"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent text-2xl"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                  maxLength={2}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Start Date
                </label>
                <input
                  type="date"
                  value={tripForm.startDate}
                  onChange={(e) => setTripForm({ ...tripForm, startDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  End Date
                </label>
                <input
                  type="date"
                  value={tripForm.endDate}
                  onChange={(e) => setTripForm({ ...tripForm, endDate: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Description
              </label>
              <textarea
                value={tripForm.description}
                onChange={(e) => setTripForm({ ...tripForm, description: e.target.value })}
                placeholder="Add notes, highlights, or memories from this trip..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-amber-500 focus:border-transparent"
                style={{fontFamily: 'Poppins, sans-serif'}}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={editingTrip ? handleUpdateTrip : handleAddTrip}
                className="px-6 py-3 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                {editingTrip ? 'Update Trip' : 'Add Trip'}
              </button>
              <button
                onClick={() => {
                  setShowAddTrip(false)
                  setEditingTrip(null)
                  setTripForm({
                    title: '',
                    location: '',
                    emoji: '✈️',
                    startDate: '',
                    endDate: '',
                    description: ''
                  })
                }}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-xl transition-all duration-300"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Trips List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
            <p className="mt-4 text-gray-600" style={{fontFamily: 'Poppins, sans-serif'}}>Loading trips...</p>
          </div>
        ) : trips.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-amber-100 p-12 text-center">
            <div className="text-6xl mb-4">🗺️</div>
            <p className="text-gray-600 text-lg" style={{fontFamily: 'Poppins, sans-serif'}}>
              No trips yet. Start adding your family adventures!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {trips.map((trip) => (
              <div key={trip.id} className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-amber-100 hover:border-amber-300 p-8 transition-all duration-300">
                <div className="flex items-start justify-between">
                  <div 
                    className="flex-1 cursor-pointer"
                    onClick={() => handleTripClick(trip)}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-4xl">{trip.emoji}</span>
                      <h3 className="text-2xl font-bold text-gray-800" style={{fontFamily: 'Poppins, sans-serif'}}>
                        {trip.title}
                      </h3>
                    </div>
                    <p className="text-gray-600 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                      📍 {trip.location}
                    </p>
                    {(trip.startDate || trip.endDate) && (
                      <p className="text-gray-500 text-sm mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                        📅 {formatDate(trip.startDate)} {trip.endDate && `- ${formatDate(trip.endDate)}`}
                      </p>
                    )}
                    {trip.description && (
                      <p className="text-gray-600 text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        {trip.description}
                      </p>
                    )}
                  </div>
                  
                  <div className="flex gap-2 ml-4">
                    <button
                      onClick={() => handleEditTrip(trip)}
                      className="px-4 py-2 bg-amber-100 hover:bg-amber-200 text-amber-700 font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                      title="Edit trip"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteTrip(trip)}
                      className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                      title="Delete trip"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Trip Details Modal with Photos */}
      {selectedTrip && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-auto"
          onClick={() => setSelectedTrip(null)}
        >
          <div
            className="relative w-full max-w-6xl my-8 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedTrip(null)}
              className="sticky top-4 left-full ml-4 w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-800 font-bold text-xl shadow-lg z-10 transition-all"
            >
              ×
            </button>
            
            <div className="p-8">
              <div className="flex items-center gap-3 mb-4">
                <span className="text-5xl">{selectedTrip.emoji}</span>
                <div>
                  <h2 className="text-3xl font-bold text-gray-800" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {selectedTrip.title}
                  </h2>
                  <p className="text-gray-600 text-lg" style={{fontFamily: 'Poppins, sans-serif'}}>
                    📍 {selectedTrip.location}
                  </p>
                  {(selectedTrip.startDate || selectedTrip.endDate) && (
                    <p className="text-gray-500" style={{fontFamily: 'Poppins, sans-serif'}}>
                      📅 {formatDate(selectedTrip.startDate)} {selectedTrip.endDate && `- ${formatDate(selectedTrip.endDate)}`}
                    </p>
                  )}
                </div>
              </div>

              {selectedTrip.description && (
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6">
                  <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {selectedTrip.description}
                  </p>
                </div>
              )}

              {/* Upload Photos Section */}
              <div className="bg-gradient-to-r from-amber-50 to-rose-50 rounded-2xl border border-amber-200 p-6 mb-6">
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
                  📤 Upload Photos
                </h3>
                
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                    Photo Caption (optional)
                  </label>
                  <input
                    type="text"
                    value={photoCaption}
                    onChange={(e) => setPhotoCaption(e.target.value)}
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
                  className={`border-2 border-dashed rounded-xl p-6 text-center transition-all ${
                    dragActive
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-300 hover:border-amber-400 bg-white'
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
                      <div className="text-4xl mb-2">📸</div>
                      <p className="text-gray-600 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Drag and drop your photo here
                      </p>
                      <p className="text-gray-500 mb-3 text-sm">or</p>
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        className="px-6 py-2 bg-gradient-to-r from-amber-500 to-rose-500 text-white font-semibold rounded-lg hover:shadow-lg transition-all duration-300"
                        style={{fontFamily: 'Poppins, sans-serif'}}
                      >
                        Choose File
                      </button>
                    </>
                  )}
                </div>
              </div>

              {/* Photos Grid */}
              <div>
                <h3 className="text-xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
                  📷 Trip Photos ({tripPhotos.length})
                </h3>
                
                {loadingPhotos ? (
                  <div className="text-center py-8">
                    <div className="inline-block animate-spin rounded-full h-10 w-10 border-b-2 border-amber-600"></div>
                  </div>
                ) : tripPhotos.length === 0 ? (
                  <div className="text-center py-8 bg-gray-50 rounded-xl">
                    <div className="text-4xl mb-2">📷</div>
                    <p className="text-gray-500" style={{fontFamily: 'Poppins, sans-serif'}}>
                      No photos yet. Upload your first photo!
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {tripPhotos.map((photo) => (
                      <div
                        key={photo.id}
                        className="group relative bg-white rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 cursor-pointer border border-amber-100"
                        onClick={() => setSelectedPhoto(photo)}
                      >
                        <div className="aspect-square overflow-hidden">
                          <img
                            src={photo.url}
                            alt={photo.caption}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                        </div>
                        <div className="p-2">
                          {editingPhoto === photo.id ? (
                            <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                              <input
                                type="text"
                                value={editedPhotoCaption}
                                onChange={(e) => setEditedPhotoCaption(e.target.value)}
                                className="flex-1 text-xs px-1 py-1 border border-amber-300 rounded focus:ring-1 focus:ring-amber-500 focus:outline-none"
                                style={{fontFamily: 'Poppins, sans-serif'}}
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === 'Enter') savePhotoCaption(photo.id)
                                  if (e.key === 'Escape') cancelPhotoEdit()
                                }}
                              />
                              <button
                                onClick={() => savePhotoCaption(photo.id)}
                                className="text-green-600 hover:text-green-700 text-xs px-1"
                              >
                                ✓
                              </button>
                              <button
                                onClick={cancelPhotoEdit}
                                className="text-red-600 hover:text-red-700 text-xs px-1"
                              >
                                ✕
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center justify-between gap-1">
                              <p className="text-xs font-semibold text-gray-800 truncate flex-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                {photo.caption}
                              </p>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  startEditPhotoCaption(photo)
                                }}
                                className="text-amber-600 hover:text-amber-700 text-xs"
                              >
                                ✏️
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Photo Lightbox Modal */}
      {selectedPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-[60] flex items-center justify-center p-4 overflow-auto"
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
              {editingPhoto === selectedPhoto.id ? (
                <div className="mb-4">
                  <input
                    type="text"
                    value={editedPhotoCaption}
                    onChange={(e) => setEditedPhotoCaption(e.target.value)}
                    className="w-full text-2xl font-bold px-3 py-2 border-2 border-amber-300 rounded-lg focus:ring-2 focus:ring-amber-500 focus:outline-none"
                    style={{fontFamily: 'Poppins, sans-serif'}}
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') savePhotoCaption(selectedPhoto.id)
                      if (e.key === 'Escape') cancelPhotoEdit()
                    }}
                  />
                  <div className="flex gap-2 mt-2">
                    <button
                      onClick={() => savePhotoCaption(selectedPhoto.id)}
                      className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                    >
                      ✓ Save
                    </button>
                    <button
                      onClick={cancelPhotoEdit}
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
                    onClick={() => startEditPhotoCaption(selectedPhoto)}
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
