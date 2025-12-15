import React, { useState, useEffect, useRef } from 'react'
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
  const fileInputRef = useRef<HTMLInputElement>(null)
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
    profilePicturePath: ''
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

      if (memberForm.dateOfBirth) {
        memberData.dateOfBirth = Timestamp.fromDate(new Date(memberForm.dateOfBirth))
      }
      if (memberForm.dateOfDeath) {
        memberData.dateOfDeath = Timestamp.fromDate(new Date(memberForm.dateOfDeath))
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

      if (memberForm.dateOfBirth) {
        updateData.dateOfBirth = Timestamp.fromDate(new Date(memberForm.dateOfBirth))
      }
      if (memberForm.dateOfDeath) {
        updateData.dateOfDeath = Timestamp.fromDate(new Date(memberForm.dateOfDeath))
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
      dateOfBirth: member.dateOfBirth ? new Date(member.dateOfBirth.toMillis()).toISOString().split('T')[0] : '',
      placeOfBirth: member.placeOfBirth || '',
      gender: member.gender || 'other',
      parentIds: member.parentIds || [],
      spouseId: member.spouseId || '',
      biography: member.biography || '',
      dateOfDeath: member.dateOfDeath ? new Date(member.dateOfDeath.toMillis()).toISOString().split('T')[0] : '',
      profilePictureUrl: member.profilePictureUrl || '',
      profilePicturePath: member.profilePicturePath || ''
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

    setUploadingPhoto(true)
    setUploadProgress(0)

    const timestamp = Date.now()
    const filename = `${timestamp}_${file.name}`
    const storageRef = ref(storage, `family-members/${filename}`)
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
          alert('Photo uploaded! Click Add/Update Member to save.')
        } catch (error: any) {
          console.error('Error getting download URL:', error)
          alert(`Failed to get photo URL: ${error.message}`)
          setUploadingPhoto(false)
        }
      }
    )
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
      profilePicturePath: ''
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
    
    roots.forEach(root => {
      if (!processed.has(root.id)) {
        firstGen.push(root)
        processed.add(root.id)
        
        // Add spouse to same generation
        if (root.spouseId) {
          const spouse = members.find(m => m.id === root.spouseId)
          if (spouse && !processed.has(spouse.id)) {
            firstGen.push(spouse)
            processed.add(spouse.id)
          }
        }
      }
    })
    
    if (firstGen.length > 0) {
      generations.push(firstGen)
    }
    
    // Build subsequent generations
    let currentGen = 0
    while (currentGen < generations.length && currentGen < 10) { // Max 10 generations
      const nextGen: FamilyMember[] = []
      const nextGenIds = new Set<string>()
      
      // Collect all unique parent IDs from current generation
      const allParentIdsInGen = new Set<string>()
      generations[currentGen].forEach(parent => {
        allParentIdsInGen.add(parent.id)
      })
      
      // Get ALL children who have ANY parent in the current generation
      // This ensures siblings are grouped together
      members.forEach(person => {
        if (processed.has(person.id)) return
        
        // Check if this person has any parent in the current generation
        const hasParentInCurrentGen = person.parentIds && person.parentIds.some(parentId => 
          allParentIdsInGen.has(parentId)
        )
        
        if (hasParentInCurrentGen && !nextGenIds.has(person.id)) {
          nextGen.push(person)
          nextGenIds.add(person.id)
          processed.add(person.id)
          
          // Always add spouse to same generation
          if (person.spouseId) {
            const spouse = members.find(m => m.id === person.spouseId)
            if (spouse && !processed.has(spouse.id) && !nextGenIds.has(spouse.id)) {
              nextGen.push(spouse)
              nextGenIds.add(spouse.id)
              processed.add(spouse.id)
            }
          }
        }
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">🌳</span>
              <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-green-600 to-teal-600" style={{fontFamily: 'Poppins, sans-serif'}}>
                Family Tree
              </h1>
            </div>
            <div className="flex gap-3">
              <div className="flex bg-gray-200 rounded-xl p-1">
                <button
                  onClick={() => setViewMode('tree')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    viewMode === 'tree' 
                      ? 'bg-white text-green-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  🌳 Tree
                </button>
                <button
                  onClick={() => setViewMode('list')}
                  className={`px-4 py-2 rounded-lg font-semibold transition-all text-sm ${
                    viewMode === 'list' 
                      ? 'bg-white text-green-600 shadow' 
                      : 'text-gray-600 hover:text-gray-800'
                  }`}
                  style={{fontFamily: 'Poppins, sans-serif'}}
                >
                  📋 List
                </button>
              </div>
              <button
                onClick={() => {
                  setShowAddMember(true)
                  setEditingMember(null)
                  resetForm()
                }}
                className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-xl hover:shadow-lg transition-all duration-300"
                style={{fontFamily: 'Poppins, sans-serif'}}
              >
                ➕ Add Family Member
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
            </div>

            {/* Parents Selection */}
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2" style={{fontFamily: 'Poppins, sans-serif'}}>
                Parents
              </label>
              {memberForm.parentIds.map((parentId, index) => (
                <div key={index} className="flex gap-2 mb-2">
                  <select
                    value={parentId}
                    onChange={(e) => updateParentId(index, e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    style={{fontFamily: 'Poppins, sans-serif'}}
                  >
                    <option value="">Select parent {index + 1}</option>
                    {members.filter(m => m.id !== editingMember?.id).map(m => (
                      <option key={m.id} value={m.id}>{m.firstName} {m.lastName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => removeParentField(index)}
                    className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 font-semibold rounded-lg"
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
              {buildGenerations().map((generation, genIndex) => {
                // Skip rendering generation sections for children that are already displayed
                // under their parents (applies to Generation 3 and beyond)
                if (genIndex >= 2) {
                  const prevGen = buildGenerations()[genIndex - 1]
                  const allShownUnderParents = generation.every(person => {
                    // Check if person has parents in previous generation
                    const hasParents = person.parentIds && person.parentIds.some(parentId => 
                      prevGen.some(parent => parent.id === parentId)
                    )
                    // Or if person is a spouse of someone with parents in prev gen
                    const isSpouseOfChild = person.spouseId && prevGen.some(parent => 
                      parent.id === members.find(m => m.id === person.spouseId)?.parentIds?.[0] ||
                      parent.id === members.find(m => m.id === person.spouseId)?.parentIds?.[1]
                    )
                    return hasParents || isSpouseOfChild
                  })
                  if (allShownUnderParents) return null
                }
                
                return (
                <div key={genIndex} className="mb-16 relative">
                  <div className="flex justify-center gap-16 items-start relative">
                    {generation.map((member, memberIndex) => {
                      const spouse = member.spouseId ? members.find(m => m.id === member.spouseId) : null
                      const hasSpouseInSameGen = spouse && generation.find(m => m.id === spouse.id)
                      
                      // Skip this member if they're someone else's spouse and will be rendered with their partner
                      const isRenderedAsSpouse = generation.slice(0, memberIndex).some(m => m.spouseId === member.id)
                      if (isRenderedAsSpouse) return null
                      
                      // Get children of this couple (that are in the NEXT generation only)
                      const coupleChildren = getChildren(member.id).filter(child => {
                        const nextGen = buildGenerations()[genIndex + 1]
                        return nextGen && nextGen.find(m => m.id === child.id)
                      })
                      if (spouse) {
                        const spouseChildren = getChildren(spouse.id).filter(child => {
                          const nextGen = buildGenerations()[genIndex + 1]
                          return nextGen && nextGen.find(m => m.id === child.id)
                        })
                        spouseChildren.forEach(child => {
                          if (!coupleChildren.find(c => c.id === child.id)) {
                            coupleChildren.push(child)
                          }
                        })
                      }
                      
                      return (
                        <div key={member.id} className="relative inline-flex flex-col items-center">
                          {/* Couple container */}
                          <div className="flex gap-3 items-start justify-center relative">
                            {/* Member card */}
                            <div className="relative">
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
                              
                              {/* Connector line from person going down */}
                              {hasSpouseInSameGen && spouse && (
                                <div className="absolute top-1/3 -right-1.5 w-3 h-0.5 bg-gray-400"></div>
                              )}
                            </div>
                            
                            {/* Spouse card (if in same generation) */}
                            {hasSpouseInSameGen && spouse && (
                              <div className="relative">
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
                                
                                {/* Connector line from spouse going down */}
                                <div className="absolute top-1/3 -left-1.5 w-3 h-0.5 bg-gray-400"></div>
                              </div>
                            )}
                          </div>
                          
                          {/* Connector line down if this couple has children - only if NOT first generation */}
                          {coupleChildren.length > 0 && genIndex > 0 && (
                            <>
                              {/* Vertical line down from couple */}
                              <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                              
                              {coupleChildren.length === 1 ? (
                                <>
                                  {/* Single child - just one vertical line */}
                                  <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                  <div className="flex gap-12 items-start justify-center">
                                    {coupleChildren.map((child) => {
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
                                        
                                        {/* Render grandchildren (children of this child) */}
                                        {grandchildren.length > 0 && (
                                          <>
                                            <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                            <div className="flex gap-12">
                                              {grandchildren.map((grandchild) => (
                                                <div key={grandchild.id}>
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
                                                </div>
                                              ))}
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
                                          
                                          {/* Render grandchildren (children of this child) */}
                                          {grandchildren.length > 0 && (
                                            <>
                                              <div className="w-0.5 h-8 bg-gray-400 mx-auto"></div>
                                              <div className="flex gap-12">
                                                {grandchildren.map((grandchild) => (
                                                  <div key={grandchild.id}>
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
                                                  </div>
                                                ))}
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
              })}
            </div>
          </div>
        )}
      </main>

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
