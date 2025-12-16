/**
 * Utility script to check for duplicate family members in Firestore
 * Run this in your browser console while logged in to identify duplicates
 */

import { collection, getDocs, query, orderBy } from 'firebase/firestore'
import { db } from '../config/firebase'

export interface FamilyMember {
  id: string
  firstName: string
  lastName: string
  dateOfBirth?: any
  placeOfBirth?: string
  profilePictureUrl?: string
  profilePicturePath?: string
  gender?: 'male' | 'female' | 'other'
  parentIds?: string[]
  spouseId?: string
  biography?: string
  dateOfDeath?: any
  createdAt: any
  createdBy: string
}

export async function findDuplicateMembers() {
  try {
    const membersQuery = query(collection(db, 'familyMembers'), orderBy('lastName', 'asc'))
    const querySnapshot = await getDocs(membersQuery)
    const membersData: FamilyMember[] = []
    
    querySnapshot.forEach((doc) => {
      membersData.push({ id: doc.id, ...doc.data() } as FamilyMember)
    })

    // Group members by full name
    const nameGroups = new Map<string, FamilyMember[]>()
    
    membersData.forEach(member => {
      const fullName = `${member.firstName} ${member.lastName}`.toLowerCase().trim()
      if (!nameGroups.has(fullName)) {
        nameGroups.set(fullName, [])
      }
      nameGroups.get(fullName)!.push(member)
    })

    // Find duplicates
    const duplicates: { name: string; members: FamilyMember[] }[] = []
    
    nameGroups.forEach((members, name) => {
      if (members.length > 1) {
        duplicates.push({ name, members })
      }
    })

    // Display results
    console.log('=== DUPLICATE FAMILY MEMBERS CHECK ===')
    console.log(`Total members: ${membersData.length}`)
    console.log(`Unique names: ${nameGroups.size}`)
    console.log(`Duplicates found: ${duplicates.length}`)
    console.log('')

    if (duplicates.length === 0) {
      console.log('✅ No duplicates found!')
      return { duplicates: [], allMembers: membersData }
    }

    duplicates.forEach(({ name, members }) => {
      console.log(`\n🔴 DUPLICATE: "${name}" (${members.length} entries)`)
      members.forEach((member, idx) => {
        console.log(`  ${idx + 1}. ID: ${member.id}`)
        console.log(`     - Created: ${member.createdAt?.toDate?.()?.toLocaleString() || 'Unknown'}`)
        console.log(`     - Created by: ${member.createdBy || 'Unknown'}`)
        console.log(`     - Date of Birth: ${member.dateOfBirth?.toDate?.()?.toLocaleDateString() || 'Not set'}`)
        console.log(`     - Gender: ${member.gender || 'Not set'}`)
        console.log(`     - Parents: ${member.parentIds?.length || 0}`)
        console.log(`     - Spouse: ${member.spouseId ? 'Yes' : 'No'}`)
        console.log(`     - Profile picture: ${member.profilePictureUrl ? 'Yes' : 'No'}`)
        console.log(`     - Biography length: ${member.biography?.length || 0} chars`)
      })
    })

    console.log('\n=== SUMMARY ===')
    console.log('To delete a duplicate, use the following command in console:')
    console.log('deleteDoc(doc(db, "familyMembers", "DOCUMENT_ID_HERE"))')
    console.log('\nOr use the Delete button in the Family Tree UI')

    return { duplicates, allMembers: membersData }
  } catch (error) {
    console.error('Error checking duplicates:', error)
    throw error
  }
}

export function findMembersByName(firstName: string, lastName: string, members: FamilyMember[]) {
  const searchName = `${firstName} ${lastName}`.toLowerCase().trim()
  return members.filter(m => 
    `${m.firstName} ${m.lastName}`.toLowerCase().trim() === searchName
  )
}

// Helper to display all members organized by family
export function displayFamilyStructure(members: FamilyMember[]) {
  console.log('\n=== FAMILY STRUCTURE ===')
  
  // Find root members (those with no parents)
  const roots = members.filter(m => !m.parentIds || m.parentIds.length === 0)
  
  console.log(`\n📊 Root members (${roots.length}):`)
  roots.forEach(root => {
    console.log(`  - ${root.firstName} ${root.lastName} (ID: ${root.id})`)
    if (root.spouseId) {
      const spouse = members.find(m => m.id === root.spouseId)
      if (spouse) {
        console.log(`    💑 Spouse: ${spouse.firstName} ${spouse.lastName}`)
      }
    }
    
    // Find children
    const children = members.filter(m => m.parentIds?.includes(root.id))
    if (children.length > 0) {
      console.log(`    👶 Children (${children.length}):`)
      children.forEach(child => {
        console.log(`      - ${child.firstName} ${child.lastName} (ID: ${child.id})`)
      })
    }
  })
  
  console.log(`\n📈 Total members: ${members.length}`)
  console.log(`📈 Members with parents: ${members.filter(m => m.parentIds && m.parentIds.length > 0).length}`)
  console.log(`📈 Members with spouse: ${members.filter(m => m.spouseId).length}`)
}
