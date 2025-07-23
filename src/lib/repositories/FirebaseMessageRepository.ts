/**
 * Firebase Message Repository
 *
 * Handles all personalized message data operations with Firebase Firestore.
 * Abstracts Firebase implementation details from the service layer.
 */

import {
  CollectionReference,
  DocumentData,
  Timestamp,
  addDoc,
  collection,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
  writeBatch,
} from "firebase/firestore";
import { db } from "../api/firebase";
import { PersonalizedMessage } from "../models/models";
import {
  filterUndefinedValues,
  handleFirebaseError,
} from "./firebase-repository-utils";
import { IMessageRepository, RepositoryResult } from "./types";
import { Unsubscribe } from "firebase/firestore";

export class FirebaseMessageRepository implements IMessageRepository {
  /**
   * Get user's messages collection reference
   */
  private getMessagesCollectionRef(
    userId: string
  ): CollectionReference<DocumentData> {
    return collection(db, `users/${userId}/messages`);
  }

  /**
   * Convert Firestore document to PersonalizedMessage
   */
  private mapDocumentToMessage(
    doc: DocumentData,
    docId: string
  ): PersonalizedMessage {
    const data = doc.data();
    return {
      id: docId,
      userId: data.userId,
      content: data.content,
      timestamp: data.timestamp,
    };
  }

  /**
   * Get the latest personalized message for a user
   */
  async getLatestMessage(
    userId: string
  ): Promise<RepositoryResult<PersonalizedMessage | null>> {
    try {
      const messagesRef = this.getMessagesCollectionRef(userId);
      const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: true,
          data: null,
        };
      }

      const doc = querySnapshot.docs[0];
      const message = this.mapDocumentToMessage(doc, doc.id);

      return {
        success: true,
        data: message,
      };
    } catch (error) {
      const repositoryError = handleFirebaseError(error, "Failed to get latest message");
      return {
        success: false,
        error: repositoryError.message,
      };
    }
  }

  /**
   * Save a new personalized message
   */
  async saveMessage(
    userId: string,
    message: Omit<PersonalizedMessage, "id">
  ): Promise<RepositoryResult<string>> {
    try {
      const messagesRef = this.getMessagesCollectionRef(userId);
      const messageData = filterUndefinedValues({
        userId,
        content: message.content,
        timestamp: message.timestamp,
      });

      const docRef = await addDoc(messagesRef, messageData);

      return {
        success: true,
        data: docRef.id,
      };
    } catch (error) {
      const repositoryError = handleFirebaseError(error, "Failed to save message");
      return {
        success: false,
        error: repositoryError.message,
      };
    }
  }

  /**
   * Get message history for a user (for debugging/analytics)
   */
  async getMessageHistory(
    userId: string,
    limitCount: number = 10
  ): Promise<RepositoryResult<PersonalizedMessage[]>> {
    try {
      const messagesRef = this.getMessagesCollectionRef(userId);
      const q = query(
        messagesRef,
        orderBy("timestamp", "desc"),
        limit(limitCount)
      );
      const querySnapshot = await getDocs(q);

      const messages: PersonalizedMessage[] = [];
      querySnapshot.forEach((doc) => {
        const message = this.mapDocumentToMessage(doc, doc.id);
        messages.push(message);
      });

      return {
        success: true,
        data: messages,
      };
    } catch (error) {
      const repositoryError = handleFirebaseError(error, "Failed to get message history");
      return {
        success: false,
        error: repositoryError.message,
      };
    }
  }

  /**
   * Subscribe to latest message changes
   */
  subscribeToLatestMessage(
    userId: string,
    callback: (message: PersonalizedMessage | null) => void
  ): Unsubscribe {
    const messagesRef = this.getMessagesCollectionRef(userId);
    const q = query(messagesRef, orderBy("timestamp", "desc"), limit(1));

    return onSnapshot(
      q,
      (querySnapshot) => {
        if (querySnapshot.empty) {
          callback(null);
          return;
        }

        const doc = querySnapshot.docs[0];
        const message = this.mapDocumentToMessage(doc, doc.id);
        callback(message);
      },
      (error) => {
        console.error("Error in message subscription:", error);
        callback(null);
      }
    );
  }

  /**
   * Delete old messages (cleanup operation)
   */
  async deleteOldMessages(
    userId: string,
    olderThanDays: number
  ): Promise<RepositoryResult<void>> {
    try {
      const messagesRef = this.getMessagesCollectionRef(userId);
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);
      const cutoffTimestamp = Timestamp.fromDate(cutoffDate);

      const q = query(
        messagesRef,
        where("timestamp", "<", cutoffTimestamp)
      );
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        return {
          success: true,
        };
      }

      const batch = writeBatch(db);
      querySnapshot.docs.forEach((doc) => {
        batch.delete(doc.ref);
      });

      await batch.commit();

      return {
        success: true,
      };
    } catch (error) {
      const repositoryError = handleFirebaseError(error, "Failed to delete old messages");
      return {
        success: false,
        error: repositoryError.message,
      };
    }
  }
}

// Export repository instance
export const messageRepository = new FirebaseMessageRepository();