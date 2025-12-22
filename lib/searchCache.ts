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
  const ref = doc(db, "search_cache", key);
  const snap = await getDoc(ref);
  return snap.exists() ? (snap.data().result as SearchResult) : null;
}

export async function saveCachedSearch(
  key: string,
  result: SearchResult
) {
  const ref = doc(db, "search_cache", key);
  await setDoc(ref, {
    result,
    createdAt: Timestamp.now(), // ✅ replacement for serverTimestamp
  });
}
