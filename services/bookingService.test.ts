import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudentBookings, updateBookingPaymentStatus, getManagerBookings } from './bookingService';
import { getDocs, updateDoc, query, collection, where, orderBy, doc } from 'firebase/firestore';

// Mock Firestore functions
vi.mock('firebase/firestore', () => ({
  getFirestore: vi.fn(() => ({ type: 'firestore-db' })),
  collection: vi.fn(() => ({ type: 'collection' })),
  doc: vi.fn(() => ({ type: 'doc' })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  updateDoc: vi.fn(),
  query: vi.fn(),
  where: vi.fn(),
  orderBy: vi.fn(),
  serverTimestamp: vi.fn(() => 'mock-timestamp'),
  runTransaction: vi.fn(),
  Timestamp: {
    fromDate: vi.fn((date) => ({ toDate: () => date })),
  },
}));

describe('bookingService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getStudentBookings', () => {
    it('should return an array of bookings for a given studentId', async () => {
      const mockStudentId = 'student-123';
      const mockBookings = [
        { id: 'booking-1', studentId: mockStudentId, amount: 100 },
        { id: 'booking-2', studentId: mockStudentId, amount: 150 },
      ];

      const mockQuerySnapshot = {
        docs: mockBookings.map(b => ({
          id: b.id,
          data: () => ({ studentId: b.studentId, amount: b.amount }),
        })),
      };

      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot as any);

      const result = await getStudentBookings(mockStudentId);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('booking-1');
      expect(result[1].amount).toBe(150);
      expect(query).toHaveBeenCalled();
      expect(where).toHaveBeenCalledWith('studentId', '==', mockStudentId);
      expect(orderBy).toHaveBeenCalledWith('createdAt', 'desc');
    });

    it('should throw an error if getDocs fails', async () => {
      vi.mocked(getDocs).mockRejectedValue(new Error('Firestore error'));

      await expect(getStudentBookings('student-123')).rejects.toThrow('Firestore error');
    });
  });

  describe('updateBookingPaymentStatus', () => {
    it('should update the payment status and status of a booking', async () => {
      const mockBookingId = 'booking-123';
      
      await updateBookingPaymentStatus(mockBookingId, 'paid', 'confirmed');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'bookings', mockBookingId);
      expect(updateDoc).toHaveBeenCalledWith(expect.anything(), {
        paymentStatus: 'paid',
        status: 'confirmed',
      });
    });

    it('should throw an error if updateDoc fails', async () => {
      vi.mocked(updateDoc).mockRejectedValue(new Error('Firestore error'));

      await expect(updateBookingPaymentStatus('booking-123', 'paid', 'confirmed')).rejects.toThrow('Firestore error');
    });
  });

  describe('getManagerBookings', () => {
    it('should chunk requests if more than 30 hostels are provided', async () => {
      const mockHostelIds = Array.from({ length: 45 }, (_, i) => `hostel-${i}`);
      const mockBookings = [
        { id: 'booking-1', hostelId: 'hostel-1', createdAt: { toDate: () => new Date('2024-01-01') } },
        { id: 'booking-2', hostelId: 'hostel-35', createdAt: { toDate: () => new Date('2024-01-02') } },
      ];

      const mockQuerySnapshot = {
        docs: [
          { id: 'booking-1', data: () => mockBookings[0] },
          { id: 'booking-2', data: () => mockBookings[1] },
        ],
      };

      vi.mocked(getDocs).mockResolvedValue(mockQuerySnapshot as any);

      const result = await getManagerBookings(mockHostelIds);

      expect(getDocs).toHaveBeenCalledTimes(2); // 45 hostels = 30 + 15 (2 chunks)
      expect(result).toHaveLength(4); // 2 docs per chunk * 2 chunks
      expect(result[0].id).toBe('booking-2'); // Sorted by date desc
    });

    it('should return empty array if no hostelIds are provided', async () => {
      const result = await getManagerBookings([]);
      expect(result).toEqual([]);
    });
  });
});
