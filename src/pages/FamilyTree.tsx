﻿import React, { useState, useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'
import { storage, db } from '../config/firebase'
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { collection, addDoc, getDocs, deleteDoc, doc, query, orderBy, Timestamp, updateDoc } from 'firebase/firestore'
import { useAuth } from '../context/AuthContext'

interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: Timestamp
  placeOfBirth?: string
  profilePictureUrl?: string
  profilePicturePath?: string
  gender?: 'male' | 'female' | 'other'
  parentIds?: string[]
  spouseId?: string
  biography?: string
  dateOfDeath?: Timestamp
  displayOrder?: number
  createdAt: Timestamp
  createdBy: string
}

export const FamilyTree: React.FC = () => {
  const [members, setMembers] = useState<FamilyMember[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMember, setShowAddMember] = useState(false)
  const [editingMember, setEditingMember] = useState<FamilyMember | null>(null)
  const [selectedMember, setSelectedMember] = useState<FamilyMember | null>(null)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree')
  const [showDuplicates, setShowDuplicates] = useState(false)
  const [duplicates, setDuplicates] = useState<{ name: string; members: FamilyMember[] }[]>([])
  const [showImageCropper, setShowImageCropper] = useState(false)
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [originalFile, setOriginalFile] = useState<File | null>(null)
  const [cropPosition, setCropPosition] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const imageRef = useRef<HTMLImageElement>(null)
  const { user: currentUser } = useAuth()

  const [memberForm, setMemberForm] = useState({
    firstName: '',
    lastName: '',
    dateOfBirth: '',
    placeOfBirth: '',
    gender: 'other' as 'male' | 'female' | 'other',
    parentIds: [] as string[],
    spouseId: '',
    biography: '',
    dateOfDeath: '',
    profilePictureUrl: '',
    profilePicturePath: '',
    displayOrder: undefined as number | undefined
  })

  useEffect(() => {
    loadMembers()
  }, [])

  const loadMembers = async () => {
    try {
      const membersQuery = query(collection(db, 'familyMembers'), orderBy('lastName', 'asc'))
      const querySnapshot = await getDocs(membersQuery)
      const membersData: FamilyMember[] = []
      querySnapshot.forEach((doc) => {
        membersData.push({ id: doc.id, ...doc.data() } as FamilyMember)
      })
      setMembers(membersData)
    } catch (error: any) {
      console.error('Error loading family members:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddMember = async () => {
    if (!currentUser || !memberForm.firstName || !memberForm.lastName) {
      alert('Please fill in first name and last name')
      return
    }

    try {
      const memberData: any = {
        firstName: memberForm.firstName,
        lastName: memberForm.lastName,
        placeOfBirth: memberForm.placeOfBirth || '',
        gender: memberForm.gender,
        biography: memberForm.biography || '',
        parentIds: memberForm.parentIds.filter(id => id !== ''),
        spouseId: memberForm.spouseId || '',
        createdAt: Timestamp.now(),
        createdBy: currentUser.email
      }

      if (memberForm.displayOrder !== undefined) {
        memberData.displayOrder = memberForm.displayOrder
      }
      if (memberForm.dateOfBirth) {
        // Store date without timezone conversion
        const [year, month, day] = memberForm.dateOfBirth.split('-').map(Number)
        memberData.dateOfBirth = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }
      if (memberForm.dateOfDeath) {
        // Store date without timezone conversion
        const [year, month, day] = memberForm.dateOfDeath.split('-').map(Number)
        memberData.dateOfDeath = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }
      if (memberForm.profilePictureUrl) {
        memberData.profilePictureUrl = memberForm.profilePictureUrl
        memberData.profilePicturePath = memberForm.profilePicturePath
      }

      await addDoc(collection(db, 'familyMembers'), memberData)
      
      resetForm()
      setShowAddMember(false)
      loadMembers()
      alert('Family member added successfully!')
    } catch (error: any) {
      console.error('Error adding family member:', error)
      alert(`Failed to add family member: ${error.message}`)
    }
  }

  const handleUpdateMember = async () => {
    if (!editingMember || !memberForm.firstName || !memberForm.lastName) {
      alert('Please fill in first name and last name')
      return
    }

    try {
      const updateData: any = {
        firstName: memberForm.firstName,
        lastName: memberForm.lastName,
        placeOfBirth: memberForm.placeOfBirth || '',
        gender: memberForm.gender,
        biography: memberForm.biography || '',
        parentIds: memberForm.parentIds.filter(id => id !== ''),
        spouseId: memberForm.spouseId || ''
      }

      if (memberForm.displayOrder !== undefined) {
        updateData.displayOrder = memberForm.displayOrder
      }
      if (memberForm.dateOfBirth) {
        // Store date without timezone conversion
        const [year, month, day] = memberForm.dateOfBirth.split('-').map(Number)
        updateData.dateOfBirth = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }
      if (memberForm.dateOfDeath) {
        // Store date without timezone conversion
        const [year, month, day] = memberForm.dateOfDeath.split('-').map(Number)
        updateData.dateOfDeath = Timestamp.fromDate(new Date(year, month - 1, day, 12, 0, 0))
      }
      if (memberForm.profilePictureUrl) {
        updateData.profilePictureUrl = memberForm.profilePictureUrl
        updateData.profilePicturePath = memberForm.profilePicturePath
      }

      await updateDoc(doc(db, 'familyMembers', editingMember.id), updateData)
      
      resetForm()
      setEditingMember(null)
      loadMembers()
      alert('Family member updated successfully!')
    } catch (error: any) {
      console.error('Error updating family member:', error)
      alert(`Failed to update family member: ${error.message}`)
    }
  }

  const handleDeleteMember = async (member: FamilyMember) => {
    if (!window.confirm(`Are you sure you want to delete ${member.firstName} ${member.lastName}?`)) return

    try {
      if (member.profilePicturePath) {
        const storageRef = ref(storage, member.profilePicturePath)
        await deleteObject(storageRef)
      }

      await deleteDoc(doc(db, 'familyMembers', member.id))
      
      setMembers(members.filter(m => m.id !== member.id))
      if (selectedMember?.id === member.id) {
        setSelectedMember(null)
      }
      alert('Family member deleted successfully!')
    } catch (error: any) {
      console.error('Error deleting family member:', error)
      alert(`Failed to delete family member: ${error.message}`)
    }
  }

  const handleEditMember = (member: FamilyMember) => {
    setEditingMember(member)
    setMemberForm({
      firstName: member.firstName,
      lastName: member.lastName,
      dateOfBirth: member.dateOfBirth ? (() => {
        const date = member.dateOfBirth.toDate()
        const year = date.getFullYear()
        const month = String(date.getMonth() + 1).padStart(2, '0')
        const day = String(date.getDate()).padStart(2, '0')
        return `${year}-${month}-${day}`
      })() : '',
      placeOfBirth: member.placeOfBirth || '',
      gender: member.gender || 'other',
      parentIds: member.parentIds || [],
      spouseId: member.spouseId || '',
      biography: member.biography || '',
      dateOfDeath: member.dateOfDeath ? new Date(member.dateOfDeath.toMillis()).toISOString().split('T')[0] : '',
      profilePictureUrl: member.profilePictureUrl || '',
      profilePicturePath: member.profilePicturePath || '',
      displayOrder: member.displayOrder
    })
    setShowAddMember(false)
  }

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0 || !currentUser) return
    const file = files[0]
    
    if (!file.type.startsWith('image/')) {
      alert('Please select an image file')
      return
    }

    // Show image cropper
    const reader = new FileReader()
    reader.onload = (e) => {
      setSelectedImage(e.target?.result as string)
      setOriginalFile(file)
      setCropPosition({ x: 0, y: 0 })
      setZoom(1)
      setShowImageCropper(true)
    }
    reader.readAsDataURL(file)
  }

  const uploadCroppedImage = async (croppedBlob: Blob) => {
    if (!currentUser || !originalFile) return

    setUploadingPhoto(true)
    setUploadProgress(0)
    setShowImageCropper(false)

    const timestamp = Date.now()
    const filename = `${timestamp}_${originalFile.name}`
    const storageRef = ref(storage, `family-members/${filename}`)
    const uploadTask = uploadBytesResumable(storageRef, croppedBlob)

    uploadTask.on(
      'state_changed',
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        setUploadProgress(progress)
      },
      (error) => {
        console.error('Upload error:', error)
        alert(`Failed to upload photo: ${error.message}`)
        setUploadingPhoto(false)
      },
      async () => {
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          
          setMemberForm({
            ...memberForm,
            profilePictureUrl: downloadURL,
            profilePicturePath: `family-members/${filename}`
          })

          setUploadingPhoto(false)
          setUploadProgress(0)
          setSelectedImage(null)
          setOriginalFile(null)
          alert('Photo uploaded! Click Add/Update Member to save.')
        } catch (error: any) {
          console.error('Error getting download URL:', error)
          alert(`Failed to get photo URL: ${error.message}`)
          setUploadingPhoto(false)
        }
      }
    )
  }

  const handleCropComplete = () => {
    if (!imageRef.current || !selectedImage) return

    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const img = imageRef.current
    const size = 400 // Output size

    canvas.width = size
    canvas.height = size

    // Calculate crop area (circular crop)
    const scale = zoom
    const sourceSize = Math.min(img.naturalWidth, img.naturalHeight) / scale
    
    const sourceX = (img.naturalWidth / 2) - (sourceSize / 2) - (cropPosition.x * img.naturalWidth / img.width)
    const sourceY = (img.naturalHeight / 2) - (sourceSize / 2) - (cropPosition.y * img.naturalHeight / img.height)

    // Draw cropped image
    ctx.drawImage(
      img,
      sourceX,
      sourceY,
      sourceSize,
      sourceSize,
      0,
      0,
      size,
      size
    )

    canvas.toBlob((blob) => {
      if (blob) {
        uploadCroppedImage(blob)
      }
    }, 'image/jpeg', 0.9)
  }

  const resetForm = () => {
    setMemberForm({
      firstName: '',
      lastName: '',
      dateOfBirth: '',
      placeOfBirth: '',
      gender: 'other',
      parentIds: [],
      spouseId: '',
      biography: '',
      dateOfDeath: '',
      profilePictureUrl: '',
      profilePicturePath: '',
      displayOrder: undefined
    })
  }

  const formatDate = (timestamp?: Timestamp) => {
    if (!timestamp) return 'Unknown'
    return timestamp.toDate().toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })
  }

  const getAge = (dateOfBirth?: Timestamp, dateOfDeath?: Timestamp) => {
    if (!dateOfBirth) return ''
    const endDate = dateOfDeath ? dateOfDeath.toDate() : new Date()
    const birthDate = dateOfBirth.toDate()
    const age = endDate.getFullYear() - birthDate.getFullYear()
    const monthDiff = endDate.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birthDate.getDate())) {
      return age - 1
    }
    return age
  }

  const getMemberName = (id: string) => {
    const member = members.find(m => m.id === id)
    return member ? `${member.firstName} ${member.lastName}` : 'Unknown'
  }

  const getChildren = (parentId: string) => {
    return members.filter(m => m.parentIds?.includes(parentId))
  }

  const getParents = (member: FamilyMember) => {
    if (!member.parentIds || member.parentIds.length === 0) return []
    return members.filter(m => member.parentIds?.includes(m.id))
  }

  const getSiblings = (member: FamilyMember) => {
    if (!member.parentIds || member.parentIds.length === 0) return []
    return members.filter(m => 
      m.id !== member.id && 
      m.parentIds?.some(parentId => member.parentIds?.includes(parentId))
    )
  }

  const updateDisplayOrder = async (memberId: string, newOrder: number) => {
    try {
      console.log('Updating display order:', { memberId, newOrder })
      await updateDoc(doc(db, 'familyMembers', memberId), {
        displayOrder: newOrder
      })
      console.log('Display order updated successfully')
      await loadMembers()
    } catch (error: any) {
      console.error('Error updating display order:', error)
      alert(`Failed to update order: ${error.message}`)
    }
  }

  const moveLeft = async (member: FamilyMember) => {
    console.log('Moving left:', member.firstName, member.lastName)
    const currentOrder = member.displayOrder ?? 500
    const newOrder = currentOrder - 100
    console.log('Current order:', currentOrder, 'New order:', newOrder)
    
    // If person has a spouse, move them together
    if (member.spouseId) {
      const spouse = members.find(m => m.id === member.spouseId)
      if (spouse) {
        console.log('Also moving spouse:', spouse.firstName, spouse.lastName)
        await updateDisplayOrder(spouse.id, newOrder)
      }
    }
    
    await updateDisplayOrder(member.id, newOrder)
  }

  const moveRight = async (member: FamilyMember) => {
    console.log('Moving right:', member.firstName, member.lastName)
    const currentOrder = member.displayOrder ?? 500
    const newOrder = currentOrder + 100
    console.log('Current order:', currentOrder, 'New order:', newOrder)
    
    // If person has a spouse, move them together
    if (member.spouseId) {
      const spouse = members.find(m => m.id === member.spouseId)
      if (spouse) {
        console.log('Also moving spouse:', spouse.firstName, spouse.lastName)
        await updateDisplayOrder(spouse.id, newOrder)
      }
    }
    
    await updateDisplayOrder(member.id, newOrder)
  }

  const checkForDuplicates = () => {
    console.log('=== CHECKING FOR DUPLICATES ===')
    console.log('Total members:', members.length)
    
    // Log all Mehmet Beyhan entries for debugging
    const mehmets = members.filter(m => 
      m.firstName.toLowerCase().includes('mehmet') && 
      m.lastName.toLowerCase().includes('beyhan')
    )
    console.log('Mehmet Beyhan entries found:', mehmets.length)
    mehmets.forEach((m, idx) => {
      console.log(`Mehmet #${idx + 1}:`, {
        id: m.id,
        firstName: m.firstName,
        lastName: m.lastName,
        dateOfBirth: m.dateOfBirth?.toDate?.()?.toLocaleDateString(),
        dateOfDeath: m.dateOfDeath?.toDate?.()?.toLocaleDateString(),
        spouseId: m.spouseId,
        parentIds: m.parentIds,
        children: getChildren(m.id).length
      })
    })
    
    // Group members by full name (case-insensitive, exact match)
    const exactNameGroups = new Map<string, FamilyMember[]>()
    
    members.forEach(member => {
      const exactName = `${member.firstName.trim()} ${member.lastName.trim()}`.toLowerCase()
      if (!exactNameGroups.has(exactName)) {
        exactNameGroups.set(exactName, [])
      }
      exactNameGroups.get(exactName)!.push(member)
    })

    // Find duplicates
    const found: { name: string; members: FamilyMember[] }[] = []
    
    exactNameGroups.forEach((memberList, name) => {
      if (memberList.length > 1) {
        found.push({ name: name + ' (exact match)', members: memberList })
      }
    })

    // Check for same name + same birth/death dates
    const dateGroups = new Map<string, FamilyMember[]>()
    members.forEach(member => {
      const birthDate = member.dateOfBirth?.toDate?.()?.toLocaleDateString() || 'no-birth'
      const deathDate = member.dateOfDeath?.toDate?.()?.toLocaleDateString() || 'no-death'
      const key = `${member.firstName.trim()} ${member.lastName.trim()}|${birthDate}|${deathDate}`.toLowerCase()
      
      if (!dateGroups.has(key)) {
        dateGroups.set(key, [])
      }
      dateGroups.get(key)!.push(member)
    })

    dateGroups.forEach((memberList, key) => {
      if (memberList.length > 1) {
        const alreadyFound = found.some(f => 
          f.members.length === memberList.length && 
          f.members.every(m => memberList.includes(m))
        )
        if (!alreadyFound) {
          found.push({ name: key.split('|')[0] + ' (same dates)', members: memberList })
        }
      }
    })

    console.log('Duplicates found:', found.length)
    console.log('Duplicate details:', found)
    
    setDuplicates(found)
    setShowDuplicates(true)
  }

  const addParentField = () => {
    if (memberForm.parentIds.length < 2) {
      setMemberForm({
        ...memberForm,
        parentIds: [...memberForm.parentIds, '']
      })
    }
  }

  // Get root members (oldest generation - those with no parents AND not married to someone with parents)
  const getRootMembers = () => {
    return members.filter(m => {
      const hasNoParents = !m.parentIds || m.parentIds.length === 0
      if (!hasNoParents) return false
      
      // If this person is married, check if their spouse has parents
      if (m.spouseId) {
        const spouse = members.find(s => s.id === m.spouseId)
        if (spouse && spouse.parentIds && spouse.parentIds.length > 0) {
          // Spouse has parents, so this person married into the family - not a root
          return false
        }
      }
      
      return true
    })
  }

  // Build family tree structure by generation
  const buildGenerations = () => {
    const generations: FamilyMember[][] = []
    const processed = new Set<string>()
    
    // Start with true root members (oldest generation)
    const roots = getRootMembers()
    const firstGen: FamilyMember[] = []
    const addedToFirstGen = new Set<string>()
    
    // Add all root members first (will sort them later)
    // Sort roots by displayOrder first to maintain order
    const sortedRoots = [...roots].sort((a, b) => {
      const orderA = a.displayOrder ?? 1000
      const orderB = b.displayOrder ?? 1000
      return orderA - orderB
    })
    
    sortedRoots.forEach(root => {
      if (!addedToFirstGen.has(root.id)) {
        firstGen.push(root)
        processed.add(root.id)
        addedToFirstGen.add(root.id)
      }
    })
    
    // First generation is already sorted from the roots
    console.log('=== FIRST GENERATION ===')
    console.log('Members:', firstGen.map(m => `${m.firstName} ${m.lastName} (${m.displayOrder ?? 1000})`).join(', '))
    
    if (firstGen.length > 0) {
      generations.push(firstGen)
    }
    
    // Build subsequent generations
    let currentGen = 0
    while (currentGen < generations.length && currentGen < 10) { // Max 10 generations
      const nextGen: FamilyMember[] = []
      const nextGenIds = new Set<string>()
      
      // Process parents in order they appear in current generation
      // This keeps sibling groups together visually
      generations[currentGen].forEach(parent => {
        // Get children of this parent
        const childrenOfParent = members.filter(person => 
          !processed.has(person.id) &&
          person.parentIds && 
          person.parentIds.includes(parent.id)
        )
        
        // Sort children by displayOrder (if set), then by birth date, then by name
        childrenOfParent.sort((a, b) => {
          // First by displayOrder if both have it
          if (a.displayOrder !== undefined && b.displayOrder !== undefined) {
            return a.displayOrder - b.displayOrder
          }
          if (a.displayOrder !== undefined) return -1
          if (b.displayOrder !== undefined) return 1
          
          // Then by birth date
          if (a.dateOfBirth && b.dateOfBirth) {
            return a.dateOfBirth.toMillis() - b.dateOfBirth.toMillis()
          }
          
          // Finally by name
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`)
        })
        
        // Add each child and their spouse
        childrenOfParent.forEach(child => {
          if (!nextGenIds.has(child.id)) {
            nextGen.push(child)
            nextGenIds.add(child.id)
            processed.add(child.id)
            
            // Add spouse immediately after this child (even if spouse has different/no parents)
            if (child.spouseId) {
              const spouse = members.find(m => m.id === child.spouseId)
              if (spouse && !nextGenIds.has(spouse.id)) {
                nextGen.push(spouse)
                nextGenIds.add(spouse.id)
                processed.add(spouse.id)
              }
            }
          } else if (child.spouseId && !nextGenIds.has(child.spouseId)) {
            // If child was already added but spouse wasn't, add spouse now
            const spouse = members.find(m => m.id === child.spouseId)
            if (spouse && !nextGenIds.has(spouse.id)) {
              nextGen.push(spouse)
              nextGenIds.add(spouse.id)
              processed.add(spouse.id)
            }
          }
        })
      })
      
      if (nextGen.length > 0) {
        generations.push(nextGen)
      }
      currentGen++
    }
    
    // Add any unprocessed members to the end
    const unprocessed = members.filter(m => !processed.has(m.id))
    if (unprocessed.length > 0) {
      generations.push(unprocessed)
    }
    
    return generations
  }

  const updateParentId = (index: number, value: string) => {
    const newParentIds = [...memberForm.parentIds]
    newParentIds[index] = value
    setMemberForm({
      ...memberForm,
      parentIds: newParentIds
    })
  }

  const removeParentField = (index: number) => {
    const newParentIds = memberForm.parentIds.filter((_, i) => i !== index)
    setMemberForm({
      ...memberForm,
      parentIds: newParentIds
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50">
      {/* Header - Step 1 complete, continue in next message */}
      <header className="bg-white/80 backdrop-blur-md shadow-md border-b border-green-100">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <Link to="/dashboard" className="inline-flex items-center text-green-600 hover:text-green-700 font-semibold mb-3 transition-colors" style={{fontFamily: 'Poppins, sans-serif'}}>
            ← Back to Dashboard
          </Link>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-3xl sm:text-4xl">🌳</span>
              <h1 className="text-2xl sm:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600" style={{fontFamily: 'Poppins, sans-serif'}}>
                Family Tree
              </h1>
            </div>
            <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
              <div className="flex bg-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                    viewMode === 'tree' 
                      ? 'bg-white text-green-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  🌳 <span className="hidden xs:inline">Tree</span>
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-2 sm:px-4 py-2 rounded-lg font-semibold transition-all text-xs sm:text-sm ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  📋 <span className="hidden xs:inline">List</span>
                </button>
              </div>
              <button
                onClick={() => {
                  setShowAddMember(true)
                  setEditingMember(null)
                  resetForm()
                }}
                className="flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 text-xs sm:text-base whitespace-nowrap"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                ➕ Add Member
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        {/* Add/Edit Member Form */}
        {(showAddMember || editingMember) && (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100 p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-800 mb-6" style={{fontFamily: 'Poppins, sans-serif'}}>
              {editingMember ? 'Edit Family Member' : 'Add New Family Member'}
            </h2>
            
            {/* Profile Picture Upload */}
            <div className="mb-6">
              <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Profile Picture
              </label>
              <div className="flex items-center gap-4">
                {memberForm.profilePictureUrl ? (
                  <div className="relative">
                    <img
                      src={memberForm.profilePictureUrl}
                      alt="Profile"
                      className="w-24 h-24 rounded-full object-cover border-4 border-green-200"
                    />
                    <button
                      onClick={() => setMemberForm({ ...memberForm, profilePictureUrl: '', profilePicturePath: '' })}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                    >
                      ×
                    </button>
                  </div>
                ) : (
                  <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-3xl">
                    👤
                  </div>
                )}
                
                <div className="flex-1">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileSelect(e.target.files)}
                    className="hidden"
                    disabled={uploadingPhoto}
                  />
                  
                  {uploadingPhoto ? (
                    <div className="space-y-2">
                      <div className="text-green-600 font-semibold text-sm" style={{fontFamily: 'Poppins, sans-serif'}}>
                        Uploading... {Math.round(uploadProgress)}%
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-teal-500 h-full transition-all duration-300"
                          style={{ width: `${uploadProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  ) : (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                    >
                      📷 Upload Photo
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  First Name *
                </label>
                <input
                  type="text"
                  value={memberForm.firstName}
                  onChange={(e) => setMemberForm({ ...memberForm, firstName: e.target.value })}
                  placeholder="John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Last Name *
                </label>
                <input
                  type="text"
                  value={memberForm.lastName}
                  onChange={(e) => setMemberForm({ ...memberForm, lastName: e.target.value })}
                  placeholder="Doe"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Date of Birth
                </label>
                <input
                  type="date"
                  value={memberForm.dateOfBirth}
                  onChange={(e) => setMemberForm({ ...memberForm, dateOfBirth: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Place of Birth
                </label>
                <input
                  type="text"
                  value={memberForm.placeOfBirth}
                  onChange={(e) => setMemberForm({ ...memberForm, placeOfBirth: e.target.value })}
                  placeholder="City, Country"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Gender
                </label>
                <select
                  value={memberForm.gender}
                  onChange={(e) => setMemberForm({ ...memberForm, gender: e.target.value as 'male' | 'female' | 'other' })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  <option value="other">Prefer not to say</option>
                  <option value="male">Male</option>
                  <option value="female">Female</option>
                </select>
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Date of Death (if applicable)
                </label>
                <input
                  type="date"
                  value={memberForm.dateOfDeath}
                  onChange={(e) => setMemberForm({ ...memberForm, dateOfDeath: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>

              <div>
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Display Order (lower = left, higher = right)
                </label>
                <input
                  type="number"
                  value={memberForm.displayOrder ?? ''}
                  onChange={(e) => setMemberForm({ ...memberForm, displayOrder: e.target.value ? parseInt(e.target.value) : undefined })}
                  placeholder="Leave empty for default"
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                />
              </div>
            </div>

            {/* Parents Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Parents
              </label>
              {memberForm.parentIds.map((parentId, index) => (
                <div key={index} className="flex flex-col sm:flex-row gap-2 mb-2 w-full">
                  <select
                    value={parentId}
                    onChange={(e) => updateParentId(index, e.target.value)}
                    className="min-w-0 w-full sm:flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{fontFamily: 'Poppins, sans-serif'}}
                  >
                    <option value="">Select parent {index + 1}</option>
                    {members.filter(m => m.id !== editingMember?.id).map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeParentField(index)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg w-full sm:w-auto"
                  >
                    Remove
                  </button>
                </div>
              ))}
              {memberForm.parentIds.length < 2 && (
                <button
                  onClick={addParentField}
                  className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-700 font-semibold rounded-lg"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  + Add Parent
                </button>
              )}
            </div>

            {/* Spouse Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Spouse
              </label>
              <select
                value={memberForm.spouseId}
                onChange={(e) => setMemberForm({ ...memberForm, spouseId: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                <option value="">No spouse</option>
                {members.filter(m => m.id !== editingMember?.id).map(m => (
                  <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                ))}
              </select>
            </div>

            {/* Biography */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Biography / Notes
              </label>
              <textarea
                value={memberForm.biography}
                onChange={(e) => setMemberForm({ ...memberForm, biography: e.target.value })}
                placeholder="Add notes, stories, or memories about this person..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                style={{fontFamily: 'Poppins, sans-serif'}}
                rows={4}
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={editingMember ? handleUpdateMember : handleAddMember}
                disabled={uploadingPhoto}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300 disabled:opacity-50"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                {editingMember ? 'Update Member' : 'Add Member'}
              </button>
              <button
                onClick={() => {
                  setShowAddMember(false)
                  setEditingMember(null)
                  resetForm()
                }}
                className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-xl transition-all duration-300"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Members Display */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
            <p className="mt-4 text-gray-600" style={{fontFamily: 'Poppins, sans-serif'}}>Loading family members...</p>
          </div>
        ) : members.length === 0 ? (
          <div className="bg-white/90 backdrop-blur-sm rounded-3xl shadow-xl border border-green-100 p-12 text-center">
            <div className="text-6xl mb-4">🌱</div>
            <p className="text-gray-600 text-lg" style={{fontFamily: 'Poppins, sans-serif'}}>
              No family members yet. Start building your family tree!
            </p>
          </div>
        ) : viewMode === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {members.map((member) => (
              <div
                key={member.id}
                className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-2xl border border-green-100 overflow-hidden transition-all duration-300 transform hover:scale-105 cursor-pointer"
                onClick={() => setSelectedMember(member)}
              >
                <div className="h-32 bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center">
                  {member.profilePictureUrl ? (
                    <img
                      src={member.profilePictureUrl}
                      alt={`${member.firstName} ${member.lastName}`}
                      className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                    />
                  ) : (
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center text-4xl shadow-lg">
                      {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'}
                    </div>
                  )}
                </div>
                
                <div className="p-4">
                  <h3 className="text-xl font-bold text-gray-800 mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {member.firstName} {member.lastName}
                  </h3>
                  
                  {member.dateOfBirth && (
                    <p className="text-sm text-gray-600" style={{fontFamily: 'Poppins, sans-serif'}}>
                      🎂 {formatDate(member.dateOfBirth)}
                      {!member.dateOfDeath && ` (${getAge(member.dateOfBirth)} years old)`}
                    </p>
                  )}
                  
                  {member.dateOfDeath && (
                    <p className="text-sm text-gray-500" style={{fontFamily: 'Poppins, sans-serif'}}>
                      † {formatDate(member.dateOfDeath)} (Age {getAge(member.dateOfBirth, member.dateOfDeath)})
                    </p>
                  )}
                  
                  {member.placeOfBirth && (
                    <p className="text-sm text-gray-600 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                      📍 {member.placeOfBirth}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleEditMember(member)
                      }}
                      className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeleteMember(member)
                      }}
                      className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* Tree View - Ancestry.com Style */
          <div className="overflow-x-auto pb-12">
            <div className="min-w-max px-12">
              {(() => {
                const generations = buildGenerations()
                
                return generations.map((generation, genIndex) => {
                // Only render generations 1 and 2 as separate sections
                // All other generations are shown as children/grandchildren
                if (genIndex >= 2) {
                  return null
                }
                
                console.log(`=== RENDERING GENERATION ${genIndex + 1} ===`)
                console.log('Members:', generation.map(m => `${m.firstName} ${m.lastName}`).join(', '))
                
                return (
                <div key={genIndex} className="mb-16 relative" style={{ paddingTop: '40px' }}>
                  <div className="flex justify-center gap-16 items-start relative">
                    {generation.map((member, memberIndex) => {
                      console.log(`Rendering member: ${member.firstName} ${member.lastName}, spouse: ${member.spouseId ? members.find(m => m.id === member.spouseId)?.firstName : 'none'}`)
                      const spouse = member.spouseId ? members.find(m => m.id === member.spouseId) : null
                      const hasSpouseInSameGen = spouse && generation.find(m => m.id === spouse.id)
                      
                      // Skip this member if:
                      // 1. They're already rendered as someone BEFORE them's spouse, OR
                      // 2. They have a spouse who comes BEFORE them (so render with the spouse who comes first)
                      const isRenderedAsSpouse = generation.slice(0, memberIndex).some(m => m.spouseId === member.id)
                      const hasSpouseBeforeThem = hasSpouseInSameGen && memberIndex > generation.findIndex(m => m.id === member.spouseId)
                      
                      if (isRenderedAsSpouse || hasSpouseBeforeThem) {
                        return null
                      }
                      
                      // Get children of this couple (that are in the NEXT generation only)
                      const allChildrenOfMember = getChildren(member.id)
                      const coupleChildren = allChildrenOfMember.filter(child => {
                        const nextGen = generations[genIndex + 1]
                        return nextGen && nextGen.find(m => m.id === child.id)
                      })
                      if (spouse) {
                        const spouseChildren = getChildren(spouse.id).filter(child => {
                          const nextGen = generations[genIndex + 1]
                          return nextGen && nextGen.find(m => m.id === child.id)
                        })
                        spouseChildren.forEach(child => {
                          if (!coupleChildren.find(c => c.id === child.id)) {
                            coupleChildren.push(child)
                          }
                        })
                      }
                      
                      // Debug ALL couples with children
                      if (coupleChildren.length > 0) {
                        console.log(`Couple: ${member.firstName} ${member.lastName} + ${spouse?.firstName} ${spouse?.lastName}`)
                        console.log(`  Children (${coupleChildren.length}):`, coupleChildren.map(c => `${c.firstName} ${c.lastName}`))
                      } else if (allChildrenOfMember.length > 0) {
                        console.log(`${member.firstName} ${member.lastName} has ${allChildrenOfMember.length} children but 0 in next gen`)
                        console.log(`  All children:`, allChildrenOfMember.map(c => `${c.firstName} ${c.lastName}`))
                        console.log(`  Next gen has:`, generations[genIndex + 1] ? generations[genIndex + 1].map(m => `${m.firstName} ${m.lastName}`).slice(0, 5) : 'NONE')
                      }
                      
                      return (
                        <div key={member.id} className="relative inline-flex flex-col items-center">
                          {/* Couple container */}
                          <div className="flex gap-3 items-start justify-center relative">
                            {/* Member card */}
                            <div className="relative group">
                              <div
                                onClick={() => setSelectedMember(member)}
                                className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                              >
                                <div className="h-20 bg-gray-100 flex items-center justify-center">
                                  {member.profilePictureUrl ? (
                                    <img
                                      src={member.profilePictureUrl}
                                      alt={`${member.firstName} ${member.lastName}`}
                                      className="w-16 h-16 rounded-lg object-cover"
                                    />
                                  ) : (
                                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                      {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'}
                                    </div>
                                  )}
                                </div>
                                
                                <div className="p-2 text-center bg-white">
                                  <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                    {member.firstName}
                                  </h3>
                                  <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                    {member.lastName}
                                  </h3>
                                  {member.dateOfBirth && (
                                    <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                      {member.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                      {member.dateOfDeath && ` - ${member.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                    </p>
                                  )}
                                </div>
                              </div>
                              
                              {/* Reorder buttons - visible on hover */}
                              <div className="absolute -top-9 left-0 right-0 flex justify-center gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity" style={{ marginBottom: '4px' }}>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveLeft(member)
                                  }}
                                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-xl border-2 border-blue-700 transition-all"
                                  title="Move left"
                                >
                                  ⬅
                                </button>
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    moveRight(member)
                                  }}
                                  className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-xl border-2 border-blue-700 transition-all"
                                  title="Move right"
                                >
                                  ➡
                                </button>
                              </div>
                              
                              {/* Connector line from person going down */}
                              {hasSpouseInSameGen && spouse && (
                                <div className="absolute top-1/3 -right-1.5 w-3 h-0.5 bg-gray-400"></div>
                              )}
                            </div>
                            
                            {/* Spouse card (if in same generation) */}
                            {hasSpouseInSameGen && spouse && (
                              <div className="relative group">
                                <div
                                  onClick={() => setSelectedMember(spouse)}
                                  className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                >
                                  <div className="h-20 bg-gray-100 flex items-center justify-center">
                                    {spouse.profilePictureUrl ? (
                                      <img
                                        src={spouse.profilePictureUrl}
                                        alt={`${spouse.firstName} ${spouse.lastName}`}
                                        className="w-16 h-16 rounded-lg object-cover"
                                      />
                                    ) : (
                                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                        {spouse.gender === 'male' ? '👨' : spouse.gender === 'female' ? '👩' : '👤'}
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="p-2 text-center bg-white">
                                    <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                      {spouse.firstName}
                                    </h3>
                                    <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                      {spouse.lastName}
                                    </h3>
                                    {spouse.dateOfBirth && (
                                      <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                        {spouse.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                        {spouse.dateOfDeath && ` - ${spouse.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                      </p>
                                    )}
                                  </div>
                                </div>
                                
                                {/* Reorder buttons - visible on hover */}
                                <div className="absolute -top-9 left-0 right-0 flex justify-center gap-2 z-50 opacity-0 group-hover:opacity-100 transition-opacity" style={{ marginBottom: '4px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moveLeft(spouse)
                                    }}
                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-xl border-2 border-blue-700 transition-all"
                                    title="Move left"
                                  >
                                    ⬅
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      moveRight(spouse)
                                    }}
                                    className="px-3 py-1.5 bg-blue-500 hover:bg-blue-600 text-white text-sm font-bold rounded-lg shadow-xl border-2 border-blue-700 transition-all"
                                    title="Move right"
                                  >
                                    ➡
                                  </button>
                                </div>
                                
                                {/* Connector line from spouse going down */}
                                <div className="absolute top-1/3 -left-1.5 w-3 h-0.5 bg-gray-400"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Connector line down if this couple has children - only if NOT first generation */}
                          {coupleChildren.length > 0 && genIndex > 0 && (() => {
                            console.log(`WILL RENDER ${coupleChildren.length} children for ${member.firstName}`)
                            return true
                          })() && (
                            <>
                              {/* Vertical line down from couple */}
                              <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                              
                              {coupleChildren.length === 1 ? (
                                <>
                                  {/* Single child - just one vertical line */}
                                  <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                  <div className="flex gap-12 items-start justify-center">
                                    {(() => {
                                      console.log(`  Rendering ${coupleChildren.length} child(ren)...`)
                                      return coupleChildren
                                    })().map((child) => {
                                      const childSpouse = child.spouseId ? members.find(m => m.id === child.spouseId) : null
                                      // Get grandchildren (children of this child)
                                      const grandchildren = getChildren(child.id)
                                      if (childSpouse) {
                                        const spouseGrandchildren = getChildren(childSpouse.id)
                                        spouseGrandchildren.forEach(gc => {
                                          if (!grandchildren.find(c => c.id === gc.id)) {
                                            grandchildren.push(gc)
                                          }
                                        })
                                      }
                                      
                                      // Debug all children with spouse info
                                      console.log(`  Child: ${child.firstName} ${child.lastName}, Spouse: ${childSpouse ? childSpouse.firstName + ' ' + childSpouse.lastName : 'NONE'}, Grandchildren: ${grandchildren.length}`)
                                      
                                      return (
                                      <div key={child.id} className="flex flex-col items-center">
                                        <div className="flex items-center gap-3">
                                          {/* Child card */}
                                          <div
                                            onClick={() => setSelectedMember(child)}
                                            className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                          >
                                            <div className="h-20 bg-gray-100 flex items-center justify-center">
                                              {child.profilePictureUrl ? (
                                                <img
                                                  src={child.profilePictureUrl}
                                                  alt={`${child.firstName} ${child.lastName}`}
                                                  className="w-16 h-16 rounded-lg object-cover"
                                                />
                                              ) : (
                                                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                  {child.gender === 'male' ? '👨' : child.gender === 'female' ? '👩' : '👤'}
                                                </div>
                                              )}
                                            </div>
                                            
                                            <div className="p-2 text-center bg-white">
                                              <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                {child.firstName}
                                              </h3>
                                              <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                {child.lastName}
                                              </h3>
                                              {child.dateOfBirth && (
                                                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                  {child.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                  {child.dateOfDeath && ` - ${child.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                </p>
                                              )}
                                            </div>
                                          </div>
                                          
                                          {/* Spouse connector and card */}
                                          {childSpouse && (
                                            <>
                                              <div className="w-6 h-0.5 bg-gray-400"></div>
                                              <div
                                                onClick={() => setSelectedMember(childSpouse)}
                                                className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                              >
                                                <div className="h-20 bg-gray-100 flex items-center justify-center">
                                                  {childSpouse.profilePictureUrl ? (
                                                    <img
                                                      src={childSpouse.profilePictureUrl}
                                                      alt={`${childSpouse.firstName} ${childSpouse.lastName}`}
                                                      className="w-16 h-16 rounded-lg object-cover"
                                                    />
                                                  ) : (
                                                    <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                      {childSpouse.gender === 'male' ? '👨' : childSpouse.gender === 'female' ? '👩' : '👤'}
                                                    </div>
                                                  )}
                                                </div>
                                                
                                                <div className="p-2 text-center bg-white">
                                                  <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                    {childSpouse.firstName}
                                                  </h3>
                                                  <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                    {childSpouse.lastName}
                                                  </h3>
                                                  {childSpouse.dateOfBirth && (
                                                    <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                      {childSpouse.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                      {childSpouse.dateOfDeath && ` - ${childSpouse.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                    </p>
                                                  )}
                                                </div>
                                              </div>
                                            </>
                                          )}
                                        </div>
                                        
                                        {/* Render grandchildren (children of this child) with spouses and great-grandchildren */}
                                        {grandchildren.length > 0 && (
                                          <>
                                            <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                            <div className="flex gap-12">
                                              {grandchildren.map((grandchild) => {
                                                const grandchildSpouse = grandchild.spouseId ? members.find(m => m.id === grandchild.spouseId) : null
                                                const greatGrandchildren = getChildren(grandchild.id)
                                                if (grandchildSpouse) {
                                                  getChildren(grandchildSpouse.id).forEach(ggc => {
                                                    if (!greatGrandchildren.find(c => c.id === ggc.id)) {
                                                      greatGrandchildren.push(ggc)
                                                    }
                                                  })
                                                }
                                                
                                                return (
                                                <div key={grandchild.id} className="flex flex-col items-center">
                                                  <div className="flex items-center gap-3">
                                                    <div
                                                      onClick={() => setSelectedMember(grandchild)}
                                                      className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                                    >
                                                      <div className="h-20 bg-gray-100 flex items-center justify-center">
                                                        {grandchild.profilePictureUrl ? (
                                                          <img
                                                            src={grandchild.profilePictureUrl}
                                                            alt={`${grandchild.firstName} ${grandchild.lastName}`}
                                                            className="w-16 h-16 rounded-lg object-cover"
                                                          />
                                                        ) : (
                                                          <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                            {grandchild.gender === 'male' ? '👨' : grandchild.gender === 'female' ? '👩' : '👤'}
                                                          </div>
                                                        )}
                                                      </div>
                                                      
                                                      <div className="p-2 text-center bg-white">
                                                        <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                          {grandchild.firstName}
                                                        </h3>
                                                        <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                          {grandchild.lastName}
                                                        </h3>
                                                        {grandchild.dateOfBirth && (
                                                          <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                            {grandchild.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                            {grandchild.dateOfDeath && ` - ${grandchild.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                          </p>
                                                        )}
                                                      </div>
                                                    </div>
                                                    
                                                    {/* Grandchild spouse */}
                                                    {grandchildSpouse && (
                                                      <>
                                                        <div className="w-6 h-0.5 bg-gray-400"></div>
                                                        <div
                                                          onClick={() => setSelectedMember(grandchildSpouse)}
                                                          className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                                        >
                                                          <div className="h-20 bg-gray-100 flex items-center justify-center">
                                                            {grandchildSpouse.profilePictureUrl ? (
                                                              <img
                                                                src={grandchildSpouse.profilePictureUrl}
                                                                alt={`${grandchildSpouse.firstName} ${grandchildSpouse.lastName}`}
                                                                className="w-16 h-16 rounded-lg object-cover"
                                                              />
                                                            ) : (
                                                              <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                                {grandchildSpouse.gender === 'male' ? '👨' : grandchildSpouse.gender === 'female' ? '👩' : '👤'}
                                                              </div>
                                                            )}
                                                          </div>
                                                          
                                                          <div className="p-2 text-center bg-white">
                                                            <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                              {grandchildSpouse.firstName}
                                                            </h3>
                                                            <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                              {grandchildSpouse.lastName}
                                                            </h3>
                                                            {grandchildSpouse.dateOfBirth && (
                                                              <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                {grandchildSpouse.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                                {grandchildSpouse.dateOfDeath && ` - ${grandchildSpouse.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                              </p>
                                                            )}
                                                          </div>
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                  
                                                  {/* Great-grandchildren */}
                                                  {greatGrandchildren.length > 0 && (
                                                    <>
                                                      <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                                      <div className="flex gap-6">
                                                        {greatGrandchildren.map((ggc) => (
                                                          <div
                                                            key={ggc.id}
                                                            onClick={() => setSelectedMember(ggc)}
                                                            className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-28"
                                                          >
                                                            <div className="h-16 bg-gray-100 flex items-center justify-center">
                                                              {ggc.profilePictureUrl ? (
                                                                <img
                                                                  src={ggc.profilePictureUrl}
                                                                  alt={`${ggc.firstName} ${ggc.lastName}`}
                                                                  className="w-12 h-12 rounded-lg object-cover"
                                                                />
                                                              ) : (
                                                                <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                                                                  {ggc.gender === 'male' ? '👨' : ggc.gender === 'female' ? '👩' : '👤'}
                                                                </div>
                                                              )}
                                                            </div>
                                                            
                                                            <div className="p-1 text-center bg-white">
                                                              <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                {ggc.firstName}
                                                              </h3>
                                                              <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                {ggc.lastName}
                                                              </h3>
                                                              {ggc.dateOfBirth && (
                                                                <p className="text-xs text-gray-500" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                  {ggc.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                                </p>
                                                              )}
                                                            </div>
                                                          </div>
                                                        ))}
                                                      </div>
                                                    </>
                                                  )}
                                                </div>
                                                )
                                              })}
                                            </div>
                                          </>
                                        )}
                                      </div>
                                    )})}
                                  </div>
                                </>
                              ) : (
                                <>
                                  {/* Multiple children - horizontal bar with vertical lines */}
                                  <div className="flex flex-col items-center">
                                    {/* Horizontal bar with vertical connectors */}
                                    <div className="relative h-8 flex items-start justify-center" style={{ width: `${coupleChildren.length * 128 + (coupleChildren.length - 1) * 48}px` }}>
                                      {/* Horizontal bar */}
                                      <div 
                                        className="absolute top-0 h-0.5 bg-gray-400"
                                        style={{ 
                                          left: '64px',
                                          right: '64px'
                                        }}
                                      ></div>
                                      {/* Vertical lines aligned with each child card center */}
                                      {coupleChildren.map((child, idx) => (
                                        <div
                                          key={`connector-${child.id}`}
                                          className="absolute top-0 w-0.5 h-8 bg-gray-400"
                                          style={{ left: `${64 + idx * (128 + 48)}px` }}
                                        ></div>
                                      ))}
                                    </div>
                                    
                                    {/* Children cards */}
                                    <div className="flex gap-12">
                                      {coupleChildren.map((child) => {
                                        const childSpouse = child.spouseId ? members.find(m => m.id === child.spouseId) : null
                                        // Get grandchildren (children of this child)
                                        const grandchildren = getChildren(child.id)
                                        
                                        // Debug ALL children
                                        console.log(`  Child in multiple branch: ${child.firstName} ${child.lastName}`)
                                        console.log(`    spouseId: ${child.spouseId || 'NONE'}`)
                                        console.log(`    childSpouse found: ${childSpouse ? childSpouse.firstName + ' ' + childSpouse.lastName : 'NOT FOUND'}`)
                                        console.log(`    grandchildren: ${grandchildren.length}`)
                                        if (childSpouse) {
                                          const spouseGrandchildren = getChildren(childSpouse.id)
                                          spouseGrandchildren.forEach(gc => {
                                            if (!grandchildren.find(c => c.id === gc.id)) {
                                              grandchildren.push(gc)
                                            }
                                          })
                                        }
                                        
                                        return (
                                        <div key={child.id} className="flex flex-col items-center">
                                          <div className="flex items-center gap-3">
                                            {/* Child card */}
                                            <div
                                              onClick={() => setSelectedMember(child)}
                                              className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                            >
                                              <div className="h-20 bg-gray-100 flex items-center justify-center">
                                                {child.profilePictureUrl ? (
                                                  <img
                                                    src={child.profilePictureUrl}
                                                    alt={`${child.firstName} ${child.lastName}`}
                                                    className="w-16 h-16 rounded-lg object-cover"
                                                  />
                                                ) : (
                                                  <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                    {child.gender === 'male' ? '👨' : child.gender === 'female' ? '👩' : '👤'}
                                                  </div>
                                                )}
                                              </div>
                                              
                                              <div className="p-2 text-center bg-white">
                                                <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                  {child.firstName}
                                                </h3>
                                                <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                  {child.lastName}
                                                </h3>
                                                {child.dateOfBirth && (
                                                  <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                    {child.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                    {child.dateOfDeath && ` - ${child.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            
                                            {/* Spouse connector and card */}
                                            {childSpouse && (
                                              <>
                                                <div className="w-6 h-0.5 bg-gray-400"></div>
                                                <div
                                                  onClick={() => setSelectedMember(childSpouse)}
                                                  className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                                >
                                                  <div className="h-20 bg-gray-100 flex items-center justify-center">
                                                    {childSpouse.profilePictureUrl ? (
                                                      <img
                                                        src={childSpouse.profilePictureUrl}
                                                        alt={`${childSpouse.firstName} ${childSpouse.lastName}`}
                                                        className="w-16 h-16 rounded-lg object-cover"
                                                      />
                                                    ) : (
                                                      <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                        {childSpouse.gender === 'male' ? '👨' : childSpouse.gender === 'female' ? '👩' : '👤'}
                                                      </div>
                                                    )}
                                                  </div>
                                                  
                                                  <div className="p-2 text-center bg-white">
                                                    <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                      {childSpouse.firstName}
                                                    </h3>
                                                    <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                      {childSpouse.lastName}
                                                    </h3>
                                                    {childSpouse.dateOfBirth && (
                                                      <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                        {childSpouse.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                        {childSpouse.dateOfDeath && ` - ${childSpouse.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                      </p>
                                                    )}
                                                  </div>
                                                </div>
                                              </>
                                            )}
                                          </div>
                                          
                                          {/* Render grandchildren (children of this child) with spouses and great-grandchildren */}
                                          {grandchildren.length > 0 && (
                                            <>
                                              <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                              <div className="flex gap-12">
                                                {grandchildren.map((grandchild) => {
                                                  const grandchildSpouse = grandchild.spouseId ? members.find(m => m.id === grandchild.spouseId) : null
                                                  const greatGrandchildren = getChildren(grandchild.id)
                                                  if (grandchildSpouse) {
                                                    getChildren(grandchildSpouse.id).forEach(ggc => {
                                                      if (!greatGrandchildren.find(c => c.id === ggc.id)) {
                                                        greatGrandchildren.push(ggc)
                                                      }
                                                    })
                                                  }
                                                  
                                                  return (
                                                  <div key={grandchild.id} className="flex flex-col items-center">
                                                    <div className="flex items-center gap-3">
                                                      <div
                                                        onClick={() => setSelectedMember(grandchild)}
                                                        className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                                      >
                                                        <div className="h-20 bg-gray-100 flex items-center justify-center">
                                                          {grandchild.profilePictureUrl ? (
                                                            <img
                                                              src={grandchild.profilePictureUrl}
                                                              alt={`${grandchild.firstName} ${grandchild.lastName}`}
                                                              className="w-16 h-16 rounded-lg object-cover"
                                                            />
                                                          ) : (
                                                            <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                              {grandchild.gender === 'male' ? '👨' : grandchild.gender === 'female' ? '👩' : '👤'}
                                                            </div>
                                                          )}
                                                        </div>
                                                        
                                                        <div className="p-2 text-center bg-white">
                                                          <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                            {grandchild.firstName}
                                                          </h3>
                                                          <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                            {grandchild.lastName}
                                                          </h3>
                                                          {grandchild.dateOfBirth && (
                                                            <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                              {grandchild.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                              {grandchild.dateOfDeath && ` - ${grandchild.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                            </p>
                                                          )}
                                                        </div>
                                                      </div>
                                                      
                                                      {/* Grandchild spouse */}
                                                      {grandchildSpouse && (
                                                        <>
                                                          <div className="w-6 h-0.5 bg-gray-400"></div>
                                                          <div
                                                            onClick={() => setSelectedMember(grandchildSpouse)}
                                                            className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-32"
                                                          >
                                                            <div className="h-20 bg-gray-100 flex items-center justify-center">
                                                              {grandchildSpouse.profilePictureUrl ? (
                                                                <img
                                                                  src={grandchildSpouse.profilePictureUrl}
                                                                  alt={`${grandchildSpouse.firstName} ${grandchildSpouse.lastName}`}
                                                                  className="w-16 h-16 rounded-lg object-cover"
                                                                />
                                                              ) : (
                                                                <div className="w-16 h-16 rounded-lg bg-gray-200 flex items-center justify-center text-3xl">
                                                                  {grandchildSpouse.gender === 'male' ? '👨' : grandchildSpouse.gender === 'female' ? '👩' : '👤'}
                                                                </div>
                                                              )}
                                                            </div>
                                                            
                                                            <div className="p-2 text-center bg-white">
                                                              <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                {grandchildSpouse.firstName}
                                                              </h3>
                                                              <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                {grandchildSpouse.lastName}
                                                              </h3>
                                                              {grandchildSpouse.dateOfBirth && (
                                                                <p className="text-xs text-gray-500 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                  {grandchildSpouse.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                                  {grandchildSpouse.dateOfDeath && ` - ${grandchildSpouse.dateOfDeath.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}`}
                                                                </p>
                                                              )}
                                                            </div>
                                                          </div>
                                                        </>
                                                      )}
                                                    </div>
                                                    
                                                    {/* Great-grandchildren */}
                                                    {greatGrandchildren.length > 0 && (
                                                      <>
                                                        <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                                        <div className="flex gap-6">
                                                          {greatGrandchildren.map((ggc) => (
                                                            <div
                                                              key={ggc.id}
                                                              onClick={() => setSelectedMember(ggc)}
                                                              className="bg-white rounded-xl shadow-md hover:shadow-xl border border-gray-200 overflow-hidden transition-all duration-300 cursor-pointer w-28"
                                                            >
                                                              <div className="h-16 bg-gray-100 flex items-center justify-center">
                                                                {ggc.profilePictureUrl ? (
                                                                  <img
                                                                    src={ggc.profilePictureUrl}
                                                                    alt={`${ggc.firstName} ${ggc.lastName}`}
                                                                    className="w-12 h-12 rounded-lg object-cover"
                                                                  />
                                                                ) : (
                                                                  <div className="w-12 h-12 rounded-lg bg-gray-200 flex items-center justify-center text-2xl">
                                                                    {ggc.gender === 'male' ? '👨' : ggc.gender === 'female' ? '👩' : '👤'}
                                                                  </div>
                                                                )}
                                                              </div>
                                                              
                                                              <div className="p-1 text-center bg-white">
                                                                <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                  {ggc.firstName}
                                                                </h3>
                                                                <h3 className="text-xs font-bold text-gray-800 leading-tight" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                  {ggc.lastName}
                                                                </h3>
                                                                {ggc.dateOfBirth && (
                                                                  <p className="text-xs text-gray-500" style={{fontFamily: 'Poppins, sans-serif'}}>
                                                                    {ggc.dateOfBirth.toDate().toLocaleDateString('en-US', { year: 'numeric', timeZone: 'UTC' })}
                                                                  </p>
                                                                )}
                                                              </div>
                                                            </div>
                                                          ))}
                                                        </div>
                                                      </>
                                                    )}
                                                  </div>
                                                  )
                                                })}
                                              </div>
                                            </>
                                          )}
                                        </div>
                                      )})}  
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                          
                          {/* For first generation, show connector lines to children */}
                          {coupleChildren.length > 0 && genIndex === 0 && (
                            <>
                              {/* Vertical line down from couple */}
                              <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                              
                              {coupleChildren.length === 1 ? (
                                <>
                                  {/* Single child - just one vertical line */}
                                  <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                </>
                              ) : (
                                <>
                                  {/* Multiple children - horizontal bar with vertical lines */}
                                  <div className="flex flex-col items-center">
                                    {/* Horizontal bar with vertical connectors */}
                                    <div className="relative h-8 flex items-start justify-center" style={{ width: `${coupleChildren.length * 128 + (coupleChildren.length - 1) * 48}px` }}>
                                      {/* Horizontal bar */}
                                      <div 
                                        className="absolute top-0 h-0.5 bg-gray-400"
                                        style={{ 
                                          left: '64px',
                                          right: '64px'
                                        }}
                                      ></div>
                                      {/* Vertical lines aligned with each child card center */}
                                      {coupleChildren.map((child, idx) => (
                                        <div
                                          key={`connector-gen0-${child.id}`}
                                          className="absolute top-0 w-0.5 h-8 bg-gray-400"
                                          style={{ left: `${64 + idx * (128 + 48)}px` }}
                                        ></div>
                                      ))}
                                    </div>
                                  </div>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
                )
              })
              })()}
            </div>
          </div>
        )}
      </main>

      {/* Image Cropper Modal */}
      {showImageCropper && selectedImage && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => {
            setShowImageCropper(false)
            setSelectedImage(null)
            setOriginalFile(null)
          }}
        >
          <div
            className="relative bg-white rounded-2xl shadow-2xl max-w-2xl w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <h2 className="text-2xl font-bold text-gray-800 mb-4" style={{fontFamily: 'Poppins, sans-serif'}}>
                Adjust Photo
              </h2>
              
              <div className="relative bg-gray-100 rounded-xl overflow-hidden mb-4" style={{ height: '400px' }}>
                <div 
                  className="absolute inset-0 flex items-center justify-center overflow-hidden"
                  style={{
                    cursor: 'move'
                  }}
                  onMouseDown={(e) => {
                    const startX = e.clientX - cropPosition.x
                    const startY = e.clientY - cropPosition.y
                    
                    const handleMouseMove = (moveEvent: MouseEvent) => {
                      setCropPosition({
                        x: moveEvent.clientX - startX,
                        y: moveEvent.clientY - startY
                      })
                    }
                    
                    const handleMouseUp = () => {
                      document.removeEventListener('mousemove', handleMouseMove)
                      document.removeEventListener('mouseup', handleMouseUp)
                    }
                    
                    document.addEventListener('mousemove', handleMouseMove)
                    document.addEventListener('mouseup', handleMouseUp)
                  }}
                >
                  <img
                    ref={imageRef}
                    src={selectedImage}
                    alt="Preview"
                    style={{
                      transform: `translate(${cropPosition.x}px, ${cropPosition.y}px) scale(${zoom})`,
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain'
                    }}
                    draggable={false}
                  />
                </div>
                
                {/* Circular crop guide */}
                <div className="absolute inset-0 pointer-events-none flex items-center justify-center">
                  <div 
                    className="border-4 border-white rounded-full shadow-2xl"
                    style={{ 
                      width: '300px', 
                      height: '300px',
                      boxShadow: '0 0 0 9999px rgba(0, 0, 0, 0.5)'
                    }}
                  ></div>
                </div>
              </div>

              {/* Zoom slider */}
              <div className="mb-6">
                <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                  Zoom
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="3"
                  step="0.1"
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mb-4">
                <p className="text-sm text-blue-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                  💡 <strong>Tip:</strong> Drag the image to reposition it, and use the zoom slider to adjust the size. The circle shows what will be saved.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={handleCropComplete}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  ✓ Use This Photo
                </button>
                <button
                  onClick={() => {
                    setShowImageCropper(false)
                    setSelectedImage(null)
                    setOriginalFile(null)
                  }}
                  className="px-6 py-3 bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold rounded-xl transition-all duration-300"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Duplicates Modal */}
      {showDuplicates && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-auto"
          onClick={() => setShowDuplicates(false)}
        >
          <div
            className="relative w-full max-w-4xl my-8 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800" style={{fontFamily: 'Poppins, sans-serif'}}>
                  🔍 Duplicate Members Check
                </h2>
                <button
                  onClick={() => setShowDuplicates(false)}
                  className="w-10 h-10 bg-gray-100 hover:bg-gray-200 rounded-full flex items-center justify-center text-gray-800 font-bold text-xl transition-all"
                >
                  ×
                </button>
              </div>
            </div>
            
            <div className="p-6">
              {duplicates.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-6xl mb-4">✅</div>
                  <h3 className="text-xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                    No Duplicates Found!
                  </h3>
                  <p className="text-gray-600" style={{fontFamily: 'Poppins, sans-serif'}}>
                    All family members have unique names.
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <p className="text-amber-800 font-semibold" style={{fontFamily: 'Poppins, sans-serif'}}>
                      ⚠️ Found {duplicates.length} duplicate name{duplicates.length > 1 ? 's' : ''}
                    </p>
                    <p className="text-sm text-amber-700 mt-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                      Review each duplicate below and delete the incorrect entries.
                    </p>
                  </div>

                  {duplicates.map(({ name, members: dupMembers }) => (
                    <div key={name} className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                      <h3 className="text-lg font-bold text-gray-800 mb-4 capitalize" style={{fontFamily: 'Poppins, sans-serif'}}>
                        🔴 "{name}" ({dupMembers.length} entries)
                      </h3>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {dupMembers.map((member, idx) => (
                          <div key={member.id} className="bg-white border border-gray-300 rounded-lg p-4">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center gap-3">
                                {member.profilePictureUrl ? (
                                  <img
                                    src={member.profilePictureUrl}
                                    alt={`${member.firstName} ${member.lastName}`}
                                    className="w-16 h-16 rounded-full object-cover border-2 border-gray-200"
                                  />
                                ) : (
                                  <div className="w-16 h-16 rounded-full bg-gray-200 flex items-center justify-center text-2xl">
                                    {member.gender === 'male' ? '👨' : member.gender === 'female' ? '👩' : '👤'}
                                  </div>
                                )}
                                <div>
                                  <h4 className="font-bold text-gray-800" style={{fontFamily: 'Poppins, sans-serif'}}>
                                    Entry #{idx + 1}
                                  </h4>
                                  <p className="text-xs text-gray-500" style={{fontFamily: 'Poppins, sans-serif'}}>
                                    ID: {member.id.substring(0, 8)}...
                                  </p>
                                </div>
                              </div>
                            </div>
                            
                            <div className="space-y-1 text-sm mb-3">
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Created:</strong> {member.createdAt?.toDate?.()?.toLocaleDateString() || 'Unknown'}
                              </p>
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Created by:</strong> {member.createdBy || 'Unknown'}
                              </p>
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Birth:</strong> {member.dateOfBirth ? formatDate(member.dateOfBirth) : 'Not set'}
                              </p>
                              {member.dateOfDeath && (
                                <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                  <strong>Death:</strong> {formatDate(member.dateOfDeath)}
                                </p>
                              )}
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Gender:</strong> {member.gender || 'Not set'}
                              </p>
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Parents:</strong> {member.parentIds?.length || 0}
                              </p>
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Spouse:</strong> {member.spouseId ? getMemberName(member.spouseId) : 'None'}
                              </p>
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Children:</strong> {getChildren(member.id).length}
                              </p>
                              <p className="text-gray-700" style={{fontFamily: 'Poppins, sans-serif'}}>
                                <strong>Biography:</strong> {member.biography ? `${member.biography.length} chars` : 'None'}
                              </p>
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={() => {
                                  setSelectedMember(member)
                                  setShowDuplicates(false)
                                }}
                                className="flex-1 px-3 py-2 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm font-semibold rounded-lg transition-colors"
                                style={{fontFamily: 'Poppins, sans-serif'}}
                              >
                                👁️ View
                              </button>
                              <button
                                onClick={() => {
                                  handleEditMember(member)
                                  setShowDuplicates(false)
                                }}
                                className="flex-1 px-3 py-2 bg-green-100 hover:bg-green-200 text-green-700 text-sm font-semibold rounded-lg transition-colors"
                                style={{fontFamily: 'Poppins, sans-serif'}}
                              >
                                ✏️ Edit
                              </button>
                              <button
                                onClick={async () => {
                                  if (window.confirm(`Delete "${member.firstName} ${member.lastName}" (Entry #${idx + 1})?\n\nThis will remove:\n- ${getChildren(member.id).length} child relationships\n- Spouse connection: ${member.spouseId ? 'Yes' : 'No'}\n\nThis cannot be undone!`)) {
                                    await handleDeleteMember(member)
                                    // Refresh duplicates check
                                    setTimeout(() => checkForDuplicates(), 500)
                                  }
                                }}
                                className="flex-1 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 text-sm font-semibold rounded-lg transition-colors"
                                style={{fontFamily: 'Poppins, sans-serif'}}
                              >
                                🗑️ Delete
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                    <h4 className="font-bold text-blue-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                      💡 Tips for Choosing Which to Keep
                    </h4>
                    <ul className="text-sm text-blue-700 space-y-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                      <li>• Keep the entry with more complete information (biography, dates, place of birth)</li>
                      <li>• Keep the entry with the profile picture if only one has it</li>
                      <li>• Keep the entry with more relationships (parents, spouse, children)</li>
                      <li>• Keep the entry created earlier if both are identical</li>
                      <li>• Check which entry other family members are connected to</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Member Detail Modal - Adding in final step */}
      {selectedMember && (
        <div
          className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4 overflow-auto"
          onClick={() => setSelectedMember(null)}
        >
          <div
            className="relative w-full max-w-3xl my-8 bg-white rounded-2xl shadow-2xl max-h-[90vh] overflow-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedMember(null)}
              className="sticky top-4 left-full ml-4 w-10 h-10 bg-white hover:bg-gray-100 rounded-full flex items-center justify-center text-gray-800 font-bold text-xl shadow-lg z-10 transition-all"
            >
              ×
            </button>
            
            <div className="p-8">
              <div className="flex items-start gap-6 mb-6">
                {selectedMember.profilePictureUrl ? (
                  <img
                    src={selectedMember.profilePictureUrl}
                    alt={`${selectedMember.firstName} ${selectedMember.lastName}`}
                    className="w-32 h-32 rounded-full object-cover border-4 border-green-200 shadow-lg"
                  />
                ) : (
                  <div className="w-32 h-32 rounded-full bg-gradient-to-br from-green-100 to-teal-100 flex items-center justify-center text-6xl shadow-lg">
                    {selectedMember.gender === 'male' ? '👨' : selectedMember.gender === 'female' ? '👩' : '👤'}
                  </div>
                )}
                
                <div className="flex-1">
                  <h2 className="text-3xl font-bold text-gray-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {selectedMember.firstName} {selectedMember.lastName}
                  </h2>
                  
                  {selectedMember.dateOfBirth && (
                    <p className="text-gray-700 mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                      <strong>Born:</strong> {formatDate(selectedMember.dateOfBirth)}
                      {!selectedMember.dateOfDeath && ` (${getAge(selectedMember.dateOfBirth)} years old)`}
                    </p>
                  )}
                  
                  {selectedMember.dateOfDeath && (
                    <p className="text-gray-700 mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                      <strong>Died:</strong> {formatDate(selectedMember.dateOfDeath)} (Age {getAge(selectedMember.dateOfBirth, selectedMember.dateOfDeath)})
                    </p>
                  )}
                  
                  {selectedMember.placeOfBirth && (
                    <p className="text-gray-700 mb-1" style={{fontFamily: 'Poppins, sans-serif'}}>
                      <strong>Place of Birth:</strong> {selectedMember.placeOfBirth}
                    </p>
                  )}
                </div>
              </div>

              {selectedMember.biography && (
                <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6">
                  <h3 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>Biography</h3>
                  <p className="text-gray-700 whitespace-pre-wrap" style={{fontFamily: 'Poppins, sans-serif'}}>
                    {selectedMember.biography}
                  </p>
                </div>
              )}

              {/* Relationships */}
              <div className="space-y-4">
                {getParents(selectedMember).length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>👪 Parents</h3>
                    <div className="flex flex-wrap gap-2">
                      {getParents(selectedMember).map(parent => (
                        <button
                          key={parent.id}
                          onClick={() => setSelectedMember(parent)}
                          className="px-4 py-2 bg-green-100 hover:bg-green-200 text-green-800 rounded-lg transition-colors"
                          style={{fontFamily: 'Poppins, sans-serif'}}
                        >
                          {parent.firstName} {parent.lastName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {selectedMember.spouseId && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>💑 Spouse</h3>
                    <button
                      onClick={() => {
                        const spouse = members.find(m => m.id === selectedMember.spouseId)
                        if (spouse) setSelectedMember(spouse)
                      }}
                      className="px-4 py-2 bg-pink-100 hover:bg-pink-200 text-pink-800 rounded-lg transition-colors"
                      style={{fontFamily: 'Poppins, sans-serif'}}
                    >
                      {getMemberName(selectedMember.spouseId)}
                    </button>
                  </div>
                )}

                {getSiblings(selectedMember).length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>👫 Siblings</h3>
                    <div className="flex flex-wrap gap-2">
                      {getSiblings(selectedMember).map(sibling => (
                        <button
                          key={sibling.id}
                          onClick={() => setSelectedMember(sibling)}
                          className="px-4 py-2 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-lg transition-colors"
                          style={{fontFamily: 'Poppins, sans-serif'}}
                        >
                          {sibling.firstName} {sibling.lastName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {getChildren(selectedMember.id).length > 0 && (
                  <div>
                    <h3 className="font-bold text-gray-800 mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>👶 Children</h3>
                    <div className="flex flex-wrap gap-2">
                      {getChildren(selectedMember.id).map(child => (
                        <button
                          key={child.id}
                          onClick={() => setSelectedMember(child)}
                          className="px-4 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-800 rounded-lg transition-colors"
                          style={{fontFamily: 'Poppins, sans-serif'}}
                        >
                          {child.firstName} {child.lastName}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => {
                    handleEditMember(selectedMember)
                    setSelectedMember(null)
                  }}
                  className="px-6 py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-lg transition-colors"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  ✏️ Edit Member
                </button>
                <button
                  onClick={() => {
                    handleDeleteMember(selectedMember)
                    setSelectedMember(null)
                  }}
                  className="px-6 py-2 bg-red-500 hover:bg-red-600 text-white font-semibold rounded-lg transition-colors"
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  🗑️ Delete Member
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}