import { collection } from "firebase/firestore";
import { db } from "./firebase";

export const teachersCollection = collection(db, "teachers");
export const usersCollection = collection(db, "users");
export const classesCollection = collection(db, "classes");
