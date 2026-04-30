import { describe, it, expect, vi, beforeEach } from 'vitest';
import { submitComplaint, getStudentComplaints, getManagerComplaints, updateComplaintStatus } from './complaintService';
import { addDoc, getDocs, query, where, orderBy, doc, updateDoc, serverTimestamp } from 'firebase/firestore';

vi.mock('firebase/firestore', () => ({
  collection: vi.fn(),
  addDoc: vi.fn(),
  getDocs: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  doc: vi.fn(),
  updateDoc: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
}));

vi.mock('@/lib/firebase', () => ({
  db: {},
}));

describe('complaintService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('submitComplaint', () => {
    it('should submit a complaint successfully', async () => {
      const mockComplaint = {
        userId: 'user123',
        hostelId: 'hostel123',
        managerId: 'manager123',
        title: 'Broken fan',
        message: 'The fan in room 101 is not working',
      };
      const mockDocRef = { id: 'complaint123' };
      vi.mocked(addDoc).mockResolvedValue(mockDocRef as any);

      const result = await submitComplaint(mockComplaint);

      expect(addDoc).toHaveBeenCalled();
      expect(result).toBe('complaint123');
    });
  });

  describe('getStudentComplaints', () => {
    it('should return complaints for a student', async () => {
      const mockDocs = [
        { id: 'c1', data: () => ({ title: 'C1' }) },
        { id: 'c2', data: () => ({ title: 'C2' }) },
      ];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const result = await getStudentComplaints('user123');

      expect(getDocs).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('c1');
    });
  });

  describe('getManagerComplaints', () => {
    it('should query complaints by managerId', async () => {
      const mockManagerId = 'manager-123';
      const mockDocs = [
        { id: 'c1', data: () => ({ hostelId: 'h1', title: 'C1', managerId: mockManagerId }) },
      ];
      vi.mocked(getDocs).mockResolvedValue({ docs: mockDocs } as any);

      const result = await getManagerComplaints(mockManagerId);

      expect(getDocs).toHaveBeenCalledTimes(1);
      expect(result).toHaveLength(1);
      expect(where).toHaveBeenCalledWith('managerId', '==', mockManagerId);
    });

    it('should return empty array if no managerId provided', async () => {
      const result = await getManagerComplaints('');
      expect(result).toEqual([]);
    });
  });

  describe('updateComplaintStatus', () => {
    it('should update complaint status', async () => {
      vi.mocked(updateDoc).mockResolvedValue(undefined as any);

      await updateComplaintStatus('c1', 'resolved', 'Fixed it');

      expect(updateDoc).toHaveBeenCalled();
    });
  });
});
