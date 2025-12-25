# iOS App Roadmap & Code Reference (Expo + Firebase)

This guide walks you through building an iOS app with the same functionalities as your website: a family portal for members and finance features for admin users. Each step explains the process, reasoning, and how to achieve secure, role-based access using Expo (React Native) and Firebase.

----

## 1. Feasibility & Cost

**Goal:** Understand what’s required to build and distribute your iOS app.

- You can absolutely build an iOS app with the same features as your website (family portal for members, finance for admins).
- **Costs:**
	- Apple Developer Program ($99/year) — required for testing on real devices and App Store/TestFlight distribution.
	- Mac device — needed for building and deploying iOS apps.
	- Expo/React Native and Firebase are free to use.
- **Tools:**
	- Visual Studio Code + GitHub Copilot for coding and AI assistance.
	- Expo/React Native for cross-platform mobile development (lets you reuse web logic).
	- Firebase for authentication, database, and storage.
- **Distribution:**
	- For a private app, use TestFlight (invite-only beta) or ad-hoc distribution (limited devices).

---

## 2. Recommended Approach

**Goal:** Choose the best tech stack for your needs and experience.

- **Expo (React Native):**
	- Lets you build iOS apps using JavaScript/TypeScript and React, just like your website.
	- Fast setup, easy testing, and great for learning.
	- Supports Firebase out of the box.
- **Firebase:**
	- Use the same authentication and database setup as your website.
	- Secure, scalable, and easy to manage user roles (member/admin).
- **Why this approach?**
	- You can reuse much of your web logic and experience.
	- Copilot works well for React Native and Firebase code.
	- You’ll be able to implement member-only and admin-only features just like your website.

---

## 3. Project Setup

**Goal:** Set up your development environment and create your app project.

### Step 1: Create Expo Project
- This initializes your mobile app project using Expo, which simplifies React Native development.

```sh
npx create-expo-app FamilyPortalApp
cd FamilyPortalApp
```

### Step 2: Install Dependencies
- These packages enable navigation between screens and connect your app to Firebase for authentication and data.

```sh
npm install firebase @react-navigation/native @react-navigation/stack
npx expo install react-native-screens react-native-safe-area-context
```

---

## 4. Firebase Setup

**Goal:** Connect your app to Firebase for authentication, database, and storage.

- Create a file `utils/firebase.js` to initialize Firebase using your web project’s config.
- This lets you use Firebase Auth for login, Firestore for data, and Storage for files/photos.

```js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = { /* your config */ };

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
```

---

## 5. Authentication

**Goal:** Allow users to log in securely and restrict access to app features.

- Use Firebase Auth for email/password login (same as your website).
- After login, users are routed to the main app screens.
- You can check user roles (admin/member) to show/hide finance features.

### `screens/LoginScreen.js`
// This screen lets users log in with their email and password.
// After login, you can check their role and route them accordingly.
```jsx
import React, { useState } from 'react';
import { View, TextInput, Button, Text, StyleSheet, Alert } from 'react-native';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../utils/firebase';

export default function LoginScreen({ navigation }) {
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [loading, setLoading] = useState(false);

	const handleLogin = async () => {
		setLoading(true);
		try {
			await signInWithEmailAndPassword(auth, email, password);
			navigation.replace('Dashboard');
		} catch (error) {
			Alert.alert('Login Error', error.message);
		}
		setLoading(false);
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Family Portal Login</Text>
			<TextInput
				style={styles.input}
				placeholder="Email"
				autoCapitalize="none"
				value={email}
				onChangeText={setEmail}
				keyboardType="email-address"
			/>
			<TextInput
				style={styles.input}
				placeholder="Password"
				secureTextEntry
				value={password}
				onChangeText={setPassword}
			/>
			<Button title={loading ? 'Logging in...' : 'Login'} onPress={handleLogin} disabled={loading} />
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, justifyContent: 'center', padding: 24 },
	title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, textAlign: 'center' },
	input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 16 },
});
```

---

## 6. Navigation & Protected Routes

**Goal:** Organize your app into screens and restrict access based on authentication and user roles.

- Use React Navigation to switch between screens (Login, Dashboard, Family, Finance, etc.).
- Use Firebase Auth state to show either the login screen or the main app.
- Check the user’s role from Firestore to show admin-only screens (like Finance).

### `navigation/AppNavigator.js`
```jsx
import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from '../utils/firebase';
import LoginScreen from '../screens/LoginScreen';
import DashboardScreen from '../screens/DashboardScreen';
import FinanceScreen from '../screens/FinanceScreen';
import { doc, getDoc } from 'firebase/firestore';

const Stack = createStackNavigator();

export default function AppNavigator() {
	const [user, setUser] = useState(null);
	const [isAdmin, setIsAdmin] = useState(false);
	const [loading, setLoading] = useState(true);

	useEffect(() => {
		const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
			setUser(firebaseUser);
			if (firebaseUser) {
				const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
				setIsAdmin(userDoc.exists() && userDoc.data().role === 'admin');
			} else {
				setIsAdmin(false);
			}
			setLoading(false);
		});
		return unsubscribe;
	}, []);

	if (loading) return null;

	return (
		<NavigationContainer>
			<Stack.Navigator>
				{!user ? (
					<Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
				) : (
					<>
						<Stack.Screen name="Dashboard" component={DashboardScreen} />
						{isAdmin && (
							<Stack.Screen name="Finance" component={FinanceScreen} />
						)}
					</>
				)}
			</Stack.Navigator>
		</NavigationContainer>
	);
}
```

---

## 7. Firestore User Roles

**Goal:** Manage member/admin access for your app features.

- Each user has a document in Firestore: `users/{userId}`.
- The document includes a `role` field: `"admin"` for admins, `"member"` for regular users.
- You can manually set roles in the Firebase Console or programmatically after sign-up.
- Use this role to restrict finance features to admins only.

---

## 8. Firestore Security Rules

**Goal:** Secure your app’s data so only authorized users can access sensitive information.

- These rules restrict finance data to admins, allow all authenticated users to access family data, and let users manage their own profile.
- The `isAdmin()` function checks the user’s role in Firestore.

```js
rules_version = '2';
service cloud.firestore {
	match /databases/{database}/documents {
		match /finance/{docId} {
			allow read, write: if isAdmin();
		}
		match /family/{docId} {
			allow read, write: if request.auth != null;
		}
		match /users/{userId} {
			allow read, write: if request.auth != null && request.auth.uid == userId;
		}
		function isAdmin() {
			return get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'admin';
		}
	}
}
```

---

## 9. Firestore Data Structure

**Goal:** Organize your app’s data for easy querying and secure access.

- Structure your Firestore collections to match your website’s features:
	- `users/` for user profiles and roles
	- `family/` for family group info
	- `familyMembers/` for individual member details
	- `finance/` for transactions (admin-only)
	- `assets/` for financial assets

---

## 10. Firestore CRUD Examples

**Goal:** Learn how to read, add, edit, and delete data in Firestore from your app.

- Use these code snippets to interact with Firestore collections for your portal and finance features.

### Query
```js
import { collection, getDocs } from 'firebase/firestore';
const snapshot = await getDocs(collection(db, 'finance'));
```

### Add
```js
import { addDoc } from 'firebase/firestore';
await addDoc(collection(db, 'assets'), { name, balance });
```

### Edit
```js
import { updateDoc, doc } from 'firebase/firestore';
await updateDoc(doc(db, 'assets', id), { name, balance });
```

### Delete
```js
import { deleteDoc, doc } from 'firebase/firestore';
await deleteDoc(doc(db, 'assets', id));
```

---

## 11. Real-Time Updates

**Goal:** Instantly reflect changes in your app when data is updated in Firestore.

- Use Firestore’s `onSnapshot` to listen for real-time updates (e.g., new assets, transactions, or family members).
- This is especially useful for collaborative features and admin dashboards.

```js
import { onSnapshot, collection } from 'firebase/firestore';
useEffect(() => {
	const unsubscribe = onSnapshot(collection(db, 'assets'), (snapshot) => {
		setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
	});
	return unsubscribe;
}, []);
```

---

## 12. Sample Screen: List, Add, Edit, Delete Assets

**Goal:** Build a screen that lists assets, lets users add new ones, and allows editing/deleting in real time.

- This pattern can be reused for transactions, family members, and other collections.
- For admin-only features (like finance), check the user’s role before allowing access or edits.

```jsx
import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, Button, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { db } from '../utils/firebase';

export default function AssetsScreen() {
	const [assets, setAssets] = useState([]);
	const [name, setName] = useState('');
	const [balance, setBalance] = useState('');
	const [editingId, setEditingId] = useState(null);

	useEffect(() => {
		const unsubscribe = onSnapshot(collection(db, 'assets'), (snapshot) => {
			setAssets(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
		});
		return unsubscribe;
	}, []);

	const handleAddOrUpdateAsset = async () => {
		if (!name || !balance) return;
		if (editingId) {
			await updateDoc(doc(db, 'assets', editingId), { name, balance: parseFloat(balance) });
			setEditingId(null);
		} else {
			await addDoc(collection(db, 'assets'), { name, balance: parseFloat(balance) });
		}
		setName('');
		setBalance('');
	};

	const handleEdit = (asset) => {
		setName(asset.name);
		setBalance(asset.balance.toString());
		setEditingId(asset.id);
	};

	const handleDelete = async (id) => {
		await deleteDoc(doc(db, 'assets', id));
		if (editingId === id) {
			setEditingId(null);
			setName('');
			setBalance('');
		}
	};

	return (
		<View style={styles.container}>
			<Text style={styles.title}>Assets (Edit & Delete)</Text>
			<FlatList
				data={assets}
				keyExtractor={item => item.id}
				renderItem={({ item }) => (
					<View style={styles.assetRow}>
						<Text>{item.name}: ${item.balance}</Text>
						<View style={styles.actions}>
							<TouchableOpacity onPress={() => handleEdit(item)}>
								<Text style={styles.edit}>Edit</Text>
							</TouchableOpacity>
							<TouchableOpacity onPress={() => handleDelete(item.id)}>
								<Text style={styles.delete}>Delete</Text>
							</TouchableOpacity>
						</View>
					</View>
				)}
			/>
			<TextInput
				style={styles.input}
				placeholder="Asset Name"
				value={name}
				onChangeText={setName}
			/>
			<TextInput
				style={styles.input}
				placeholder="Balance"
				value={balance}
				onChangeText={setBalance}
				keyboardType="numeric"
			/>
			<Button
				title={editingId ? "Update Asset" : "Add Asset"}
				onPress={handleAddOrUpdateAsset}
			/>
			{editingId && (
				<Button
					title="Cancel Edit"
					color="gray"
					onPress={() => {
						setEditingId(null);
						setName('');
						setBalance('');
					}}
				/>
			)}
		</View>
	);
}

const styles = StyleSheet.create({
	container: { flex: 1, padding: 24 },
	title: { fontSize: 24, fontWeight: 'bold', marginBottom: 16 },
	input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 12, marginBottom: 8 },
	assetRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
	actions: { flexDirection: 'row', gap: 12 },
	edit: { color: 'blue', marginRight: 12 },
	delete: { color: 'red' },
});
```

---

## 13. Replicating Website Functionalities

**Goal:** Achieve the same member-only family portal and admin-only finance features as your website.

- **Family Portal:**
	- Use Firestore collections (`family`, `familyMembers`) to store and display family data.
	- Restrict access to authenticated users (members).
	- Build screens for viewing, adding, and editing family members and details.
- **Finance (Admin Only):**
	- Use the `finance` and `assets` collections for transactions and assets.
	- Restrict access to users with `role: "admin"` using navigation logic and Firestore rules.
	- Build screens for viewing, adding, editing, and deleting finance data.
- **Navigation & Access Control:**
	- Use React Navigation and Firebase Auth state to route users to the correct screens.
	- Use Firestore user roles to show/hide admin features.

---

## 14. Full Process Overview

1. **Set up your Mac and Apple Developer account.**
2. **Create your Expo project and install dependencies.**
3. **Connect your app to Firebase using your web config.**
4. **Build authentication screens and logic.**
5. **Set up navigation and protected routes for member/admin access.**
6. **Design Firestore data structure to match your website’s features.**
7. **Implement CRUD operations for all collections.**
8. **Add real-time listeners for instant updates.**
9. **Write and test Firestore security rules for role-based access.**
10. **Build screens for family portal and finance features.**
11. **Test your app on iOS devices using Expo Go and TestFlight.**
12. **Distribute privately or publish to the App Store as needed.**

---

> **Clarification:** You can use Visual Studio Code and GitHub Copilot for almost all development on your personal Windows computer. A Mac device is only required for building, testing, and distributing your iOS app (steps like running on a simulator, using Xcode, or submitting to the App Store). You can do all coding, Firebase setup, and Expo development on Windows, then use a Mac for the final build and deployment steps.

---

## Alternatives: Accessing a Mac for iOS Build/Distribution

If you do not own a Mac, you still have several options for building, testing, and distributing your iOS app:

- **Mac Cloud Rental Services:**
	- [MacStadium](https://www.macstadium.com/) and [MacInCloud](https://www.macincloud.com/) let you rent a Mac in the cloud by the hour or month. You can access Xcode, run simulators, and upload to the App Store remotely.
	- [AWS EC2 Mac Instances](https://aws.amazon.com/ec2/instance-types/mac/) are another option for on-demand Mac access.
- **Borrow a Mac:**
	- If you have friends, family, or colleagues with a Mac, you can use their device for the final build and upload steps.
- **Local Apple Store or University Labs:**
	- Some Apple Stores or university computer labs provide public access to Mac computers with Xcode installed.
- **Secondhand or Refurbished Mac:**
	- Consider purchasing a used or refurbished Mac Mini, which is often the most affordable option for iOS development.

> **Note:** You only need a Mac for the final build, testing on a real device, and App Store/TestFlight distribution. All coding and most testing can be done on Windows using Expo Go and simulators.

---

## Windows vs Mac: How Much Can You Build Before You Need a Mac?

You can complete nearly all coding, setup, and local testing for your iOS app on your Windows PC using Visual Studio Code and GitHub Copilot. The only stages that require a Mac device are building the final iOS app binary, running on an iOS simulator, and distributing via TestFlight or the App Store.

**Development Breakdown:**

- **Windows PC (90–95%):**
	- Set up Expo project, install dependencies, and write all app code.
	- Connect to Firebase, implement authentication, navigation, and CRUD features.
	- Test app logic and UI using Expo Go on your iOS/Android device.
	- Write and test Firestore security rules, data structure, and real-time updates.
	- Prepare for iOS build and distribution.

- **Mac Required (Final 5–10%):**
	- Build the iOS binary (.ipa file).
	- Run on iOS simulator (optional, but only available on Mac).
	- Submit to TestFlight or App Store for distribution.

**Summary:**
You only need a Mac for the final build, testing on a real device, and App Store/TestFlight distribution. All coding and most testing can be done on Windows using Expo Go and simulators. Consider Mac cloud rental, borrowing, or public access for these final steps.

**This roadmap gives you a complete, step-by-step process to build your iOS app with the same secure, role-based features as your website. Each section explains the reasoning and actions so you can follow and adapt as you learn.**

---

## Repository Strategy: Should You Use the Same Repo?

You have two main options for managing your iOS app code:

**1. Monorepo (Recommended for Most Cases):**
- Add your iOS app as a new folder (e.g., `/mobile` or `/ios-app`) in your existing BEYHAN-FAMILY repository.
- This makes it easy to share business logic, Firebase config, and utility functions between your web and mobile apps.
- Keeps all related code in one place, which is simpler for small teams and projects with shared features.

**2. Separate Repository:**
- Create a new repository just for the iOS app.
- This provides a clean separation, which can be useful if the mobile and web apps will diverge significantly in the future.
- Slightly more overhead for sharing code and keeping logic in sync.

**Code Reusability:**
- Much of your existing code (business logic, Firebase config, utility functions, and data structure) is reusable in a React Native/Expo app.
- UI components will need to be rewritten for React Native, but authentication, Firestore logic, and most utilities can be adapted or shared.

**Recommendation:**
For your use case (shared logic, similar features, small team), a monorepo is usually best. Create a `/mobile` or `/ios-app` folder in BEYHAN-FAMILY and reuse as much code as possible. Use a package manager like Yarn Workspaces if you want to share code more formally between web and mobile.

If you need a sample folder structure or more details on code sharing, let me know!
---
