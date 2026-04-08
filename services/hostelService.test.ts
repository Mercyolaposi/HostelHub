import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getManagerHostels, getHostelById } from './hostelService';
import { getDocs, getDoc, query, collection, where, doc } from 'firebase/firestore';

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore-db' })),
  collection: vi.fn(() => ({ type: 'collection' })),
  doc: vi.fn(() => ({ type: 'doc' })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

describe('hostelService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getManagerHostels', () => {
    it('should return an array of hostels for a given managerId', async () => {
      const mockManagerId = 'manager-123';
      const mockHostels = [
        { id: 'hostel-1', name: 'Hostel 1', managerId: mockManagerId },
        { id: 'hostel-2', name: 'Hostel 2', managerId: mockManagerId },
      ];

      const mockQuerySnapshot = {
        docs: mockHostels.map(h => ({
          id: h.id,
          data: () => ({ name: h.name, managerId: h.managerId }),
        })),
      };

      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot as any);

      const result = await getManagerHostels(mockManagerId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('hostel-1');
      expect(result[1].name).toBe('Hostel 2');
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('managerId', '==', mockManagerId);
    });

    it('should throw an error if getDocs fails', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getManagerHostels('manager-123')).rejects.toThrow('Firestore error');
    });
  });

  describe('getHostelById', () => {
    it('should return a hostel if it exists', async () => {
      const mockHostelId = 'hostel-123';
      const mockHostelData = { name: 'Test Hostel', location: 'Test Location' };

      const mockDocSnap = {
        exists: () => true,
        id: mockHostelId,
        data: () => mockHostelData,
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getHostelById(mockHostelId);

      expect(result).toEqual({ id: mockHostelId, ...mockHostelData });
      expect(doc).toHaveBeenCalledWith(expect.anything(), 'hostels', mockHostelId);
    });

    it('should return null if the hostel does not exist', async () => {
      const mockDocSnap = {
        exists: () => false,
      };

      vi.mocked(getDoc).mockResolvedValue(mockDocSnap as any);

      const result = await getHostelById('non-existent');

      expect(result).toBeNull();
    });

    it('should throw an error if getDoc fails', async () => {
      vi.mocked(getDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(getHostelById('hostel-123')).rejects.toThrow('Firestore error');
    });
  });
});
