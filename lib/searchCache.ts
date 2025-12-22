import { db } from "./firebase";
import {
  doc,
  getDoc,
  setDoc,
  Timestamp
} from "firebase/firestore/lite";
import { SearchResult } from "../types";

export async function getCachedSearch(
  key: string
): Promise<SearchResult | null> {
  try {
    const ref = doc(db, "search_cache", key);
    const snap = await getDoc(ref);
    return snap.exists() ? (snap.data().result as SearchResult) : null;
  } catch (e) {
    console.warn("Firestore read failed", e);
    return null;
  }
}

export async function saveCachedSearch(
  key: string,
  result: SearchResult
) {
  try {
    const ref = doc(db, "search_cache", key);
    await setDoc(ref, {
      result,
      createdAt: Timestamp.now(),
    });
  } catch (e) {
    console.warn("Firestore write failed", e);
  }
}
