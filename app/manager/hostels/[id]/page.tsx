'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useHostelDetails } from '@/hooks/useHostels';
import { addRoomToHostel, updateRoom, deleteRoom } from '@/services/hostelService';
import { Hostel, Room } from '@/types';
import { toast } from 'sonner';
import { Trash2, Edit, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import dynamic from 'next/dynamic';

const MapView = dynamic(() => import('@/components/MapView'), { ssr: false });

const roomSchema = z.object({
  roomNumber: z.string().min(1, 'Room number is required'),
  type: z.enum(['1-in-a-room', '2-in-a-room', '3-in-a-room', '4-in-a-room']),
  pricePerSemester: z.number().min(1, 'Price must be greater than 0'),
  capacity: z.number().min(1, 'Capacity must be at least 1'),
});

export default function ManageHostelPage() {
  const { user, userData } = useAuth();
  const router = useRouter();
  const params = useParams();
  const hostelId = params.id as string;

  const { hostel, rooms, isLoading, mutateRooms } = useHostelDetails(hostelId);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Room Form State
  const [roomNumber, setRoomNumber] = useState('');
  const [roomType, setRoomType] = useState<Room['type']>('2-in-a-room');
  const [price, setPrice] = useState('');
  const [capacity, setCapacity] = useState('2');

  useEffect(() => {
    if (!user || userData?.role !== 'manager') {
      router.push('/');
      return;
    }
    
    if (hostel && hostel.managerId !== user.uid) {
      toast.error('Unauthorized access');
      router.push('/manager/dashboard');
    }
  }, [user, userData, hostel, router]);

  const handleAddRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    try {
      const validatedData = roomSchema.parse({
        roomNumber,
        type: roomType,
        pricePerSemester: Number(price),
        capacity: Number(capacity),
      });

      setIsAddingRoom(true);
      await addRoomToHostel(hostelId, {
        roomNumber: validatedData.roomNumber,
        type: validatedData.type,
        pricePerSemester: validatedData.pricePerSemester,
        capacity: validatedData.capacity,
      });
      toast.success('Room added successfully');
      
      // Reset form and refresh rooms using SWR mutate
      setRoomNumber('');
      setPrice('');
      mutateRooms();
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        const newErrors: Record<string, string> = {};
        error.issues.forEach(err => {
          if (err.path[0]) {
            newErrors[err.path[0].toString()] = err.message;
          }
        });
        setErrors(newErrors);
        toast.error('Please fix the errors in the form.');
      } else {
        toast.error(error.message || 'Failed to add room');
      }
    } finally {
      setIsAddingRoom(false);
    }
  };

  const handleToggleAvailability = async (roomId: string, currentStatus: boolean) => {
    try {
      await updateRoom(hostelId, roomId, { isAvailable: !currentStatus });
      toast.success('Room availability updated');
      mutateRooms();
    } catch (error: any) {
      toast.error(error.message || 'Failed to update availability');
    }
  };

  const handleDeleteRoom = async (roomId: string) => {
    if (!window.confirm('Are you sure you want to delete this room?')) return;
    try {
      await deleteRoom(hostelId, roomId);
      toast.success('Room deleted successfully');
      mutateRooms();
    } catch (error: any) {
      toast.error(error.message || 'Failed to delete room');
    }
  };

  if (isLoading) return (
    <div className="w-full min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-slate-900 border-t-transparent rounded-full animate-spin"></div>
    </div>
  );
  if (!hostel) return null;

  return (
    <div className="w-full min-h-screen bg-white text-slate-900 selection:bg-slate-900 selection:text-white pb-24">
      {/* Header */}
      <div className="w-full border-b border-slate-900 px-4 md:px-8 lg:px-12 py-8">
        <div className="max-w-[1400px] mx-auto flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div>
            <button 
              onClick={() => router.push('/manager/dashboard')} 
              className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-widest hover:text-slate-500 transition-colors mb-8"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </button>
            <h1 className="text-4xl md:text-6xl font-heading font-bold uppercase tracking-tighter leading-none mb-4">
              {hostel.name}
            </h1>
            <p className="text-sm font-bold uppercase tracking-widest text-slate-500">
              {hostel.location} • {hostel.isVerified ? <span className="text-slate-900">Verified</span> : <span className="text-amber-600">Pending Verification</span>}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 lg:px-12 py-16">
        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
          
          <div className="lg:col-span-8 space-y-16">
            {hostel.coordinates && (
              <div>
                <h2 className="text-2xl font-heading font-bold uppercase tracking-tighter mb-8">Location</h2>
                <div className="border border-slate-900 p-1">
                  <MapView position={hostel.coordinates} title={hostel.name} />
                </div>
              </div>
            )}

            <div>
              <h2 className="text-2xl font-heading font-bold uppercase tracking-tighter mb-8">Rooms & Pricing</h2>
              
              {rooms.length === 0 ? (
                <div className="border border-slate-900 p-12 text-center bg-slate-50">
                  <p className="text-xs font-bold uppercase tracking-widest text-slate-500">No rooms added yet. Add your first room below.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 gap-6">
                  {rooms.map(room => (
                    <div key={room.id} className={`border border-slate-900 p-6 transition-opacity ${room.isAvailable ? 'opacity-100' : 'opacity-50 bg-slate-50'}`}>
                      <div className="flex justify-between items-start mb-6">
                        <h3 className="font-bold uppercase tracking-wider text-xl">Room {room.roomNumber}</h3>
                        <span className="border border-slate-900 text-xs px-3 py-1 font-bold uppercase tracking-widest">
                          {room.type}
                        </span>
                      </div>
                      <p className="text-3xl font-heading font-bold tracking-tighter mb-6">
                        GH₵{room.pricePerSemester} <span className="text-xs font-bold uppercase tracking-widest text-slate-500">/ sem</span>
                      </p>
                      <div className="flex justify-between items-end pt-6 border-t border-slate-200">
                        <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Beds: {room.occupiedBeds} / {room.capacity}</p>
                        <div className="flex items-center gap-2">
                          <button 
                            className={`px-4 py-2 text-xs font-bold uppercase tracking-widest border border-slate-900 transition-colors ${room.isAvailable ? 'hover:bg-slate-50' : 'bg-slate-200 text-slate-500 border-slate-300'}`}
                            onClick={() => handleToggleAvailability(room.id!, room.isAvailable)}
                          >
                            {room.isAvailable ? 'Available' : 'Unavailable'}
                          </button>
                          <button 
                            className="p-2 border border-red-200 text-red-500 hover:bg-red-50 transition-colors"
                            onClick={() => handleDeleteRoom(room.id!)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-4">
            <div className="sticky top-24 border border-slate-900 p-8">
              <h2 className="text-2xl font-heading font-bold uppercase tracking-tighter mb-8">Add New Room</h2>
              
              <form onSubmit={handleAddRoom} className="space-y-6">
                <div className="space-y-2">
                  <label htmlFor="roomNumber" className="text-xs font-bold uppercase tracking-widest text-slate-500">Room Number / Name</label>
                  <input 
                    id="roomNumber" 
                    value={roomNumber}
                    onChange={(e) => setRoomNumber(e.target.value)}
                    placeholder="e.g. A101" 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                    required 
                  />
                  {errors.roomNumber && <p className="text-xs text-red-500 mt-1">{errors.roomNumber}</p>}
                </div>
                
                <div className="space-y-2">
                  <label htmlFor="type" className="text-xs font-bold uppercase tracking-widest text-slate-500">Room Type</label>
                  <select 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all appearance-none rounded-none"
                    value={roomType}
                    onChange={(e) => {
                      setRoomType(e.target.value as any);
                      setCapacity(e.target.value.split('-')[0]);
                    }}
                  >
                    <option value="1-in-a-room">1 in a room</option>
                    <option value="2-in-a-room">2 in a room</option>
                    <option value="3-in-a-room">3 in a room</option>
                    <option value="4-in-a-room">4 in a room</option>
                  </select>
                  {errors.type && <p className="text-xs text-red-500 mt-1">{errors.type}</p>}
                </div>

                <div className="space-y-2">
                  <label htmlFor="price" className="text-xs font-bold uppercase tracking-widest text-slate-500">Price per Semester (GH₵)</label>
                  <input 
                    id="price" 
                    type="number"
                    min="0"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    placeholder="e.g. 2500" 
                    className="w-full bg-transparent border-b border-slate-900 py-3 text-sm focus:outline-none focus:border-b-2 transition-all placeholder:text-slate-300 rounded-none"
                    required 
                  />
                  {errors.pricePerSemester && <p className="text-xs text-red-500 mt-1">{errors.pricePerSemester}</p>}
                </div>

                <button 
                  type="submit" 
                  className="w-full bg-slate-900 text-white py-4 text-xs font-bold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed mt-8" 
                  disabled={isAddingRoom}
                >
                  {isAddingRoom ? 'Adding...' : 'Add Room'}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

