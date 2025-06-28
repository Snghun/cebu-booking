import React, { useEffect, useState } from 'react';
import { getAdminRooms, createAdminRoom, updateAdminRoom, deleteAdminRoom } from '../../services/api';
import { X } from 'lucide-react';

// RoomForm: 신규/수정 공용 폼
const RoomForm = ({ initial, onSubmit, onCancel, loading }) => {
  const [form, setForm] = useState({
    name: initial?.name || '',
    description: initial?.description || '',
    detailedDescription: initial?.detailedDescription || '',
    price: initial?.price || '',
    image: initial?.image || '',
    images: initial?.images?.join(',') || '',
    size: initial?.size || '',
    capacity: initial?.capacity || '',
    amenities: initial?.amenities?.join(',') || '',
    features: initial?.features?.join(',') || '',
    roomType: initial?.roomType || 'standard',
    view: initial?.view || 'garden',
    isAvailable: initial?.isAvailable ?? true,
  });
  const [error, setError] = useState('');

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({
      ...f,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    // 필수값 체크
    if (!form.name || !form.description || !form.price || !form.image || !form.size || !form.capacity) {
      setError('필수 항목을 모두 입력하세요.');
      return;
    }
    setError('');
    // 배열 필드 변환
    const data = {
      ...form,
      price: Number(form.price),
      capacity: Number(form.capacity),
      images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
      amenities: form.amenities ? form.amenities.split(',').map(s => s.trim()).filter(Boolean) : [],
      features: form.features ? form.features.split(',').map(s => s.trim()).filter(Boolean) : [],
    };
    onSubmit(data);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && <div className="text-red-500 text-sm">{error}</div>}
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">객실명*</label>
          <input 
            name="name" 
            value={form.name} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">가격(숫자)*</label>
          <input 
            name="price" 
            type="number" 
            value={form.price} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">간단 설명*</label>
        <input 
          name="description" 
          value={form.description} 
          onChange={handleChange} 
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">상세 설명</label>
        <textarea 
          name="detailedDescription" 
          value={form.detailedDescription} 
          onChange={handleChange} 
          rows="3"
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">크기*</label>
          <input 
            name="size" 
            value={form.size} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">수용 인원*</label>
          <input 
            name="capacity" 
            type="number" 
            value={form.capacity} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">대표 이미지 URL*</label>
        <input 
          name="image" 
          value={form.image} 
          onChange={handleChange} 
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium mb-1">추가 이미지 URL(여러 개는 ,로 구분)</label>
        <input 
          name="images" 
          value={form.images} 
          onChange={handleChange} 
          className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
        />
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">어메니티(여러 개는 ,로 구분)</label>
          <input 
            name="amenities" 
            value={form.amenities} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">특징(여러 개는 ,로 구분)</label>
          <input 
            name="features" 
            value={form.features} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent" 
          />
        </div>
      </div>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-1">타입*</label>
          <select 
            name="roomType" 
            value={form.roomType} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="standard">스탠다드</option>
            <option value="deluxe">디럭스</option>
            <option value="suite">스위트</option>
            <option value="villa">빌라</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">전망*</label>
          <select 
            name="view" 
            value={form.view} 
            onChange={handleChange} 
            className="w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="garden">가든</option>
            <option value="ocean">오션</option>
            <option value="mountain">마운틴</option>
            <option value="city">시티</option>
          </select>
        </div>
      </div>
      
      <div className="flex items-center space-x-2">
        <input 
          name="isAvailable" 
          type="checkbox" 
          checked={form.isAvailable} 
          onChange={handleChange}
          className="rounded focus:ring-2 focus:ring-blue-500" 
        />
        <label className="text-sm">예약 가능</label>
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-6">
        <button 
          type="button" 
          onClick={onCancel} 
          className="w-full sm:w-auto px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
        >
          취소
        </button>
        <button 
          type="submit" 
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors" 
          disabled={loading}
        >
          {loading ? '저장 중...' : '저장'}
        </button>
      </div>
    </form>
  );
};

const AdminRooms = () => {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError('');
      const data = await getAdminRooms();
      setRooms(data);
    } catch (err) {
      setError('객실 목록을 불러오는데 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('정말로 이 객실을 삭제하시겠습니까?')) return;
    try {
      await deleteAdminRoom(id);
      setRooms(rooms.filter(room => room._id !== id));
    } catch (err) {
      alert('객실 삭제에 실패했습니다.');
    }
  };

  const handleRowClick = (room) => {
    setSelectedRoom(room);
    setShowModal(true);
  };

  const handleCreate = () => {
    setShowCreateModal(true);
  };

  // 신규 등록
  const handleCreateSubmit = async (data) => {
    setFormLoading(true);
    try {
      const newRoom = await createAdminRoom(data);
      setRooms([newRoom, ...rooms]);
      setShowCreateModal(false);
    } catch (err) {
      alert('객실 등록에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  // 수정
  const handleUpdateSubmit = async (data) => {
    setFormLoading(true);
    try {
      const updated = await updateAdminRoom(selectedRoom._id, data);
      setRooms(rooms.map(r => (r._id === selectedRoom._id ? updated : r)));
      setShowModal(false);
    } catch (err) {
      alert('객실 수정에 실패했습니다.');
    } finally {
      setFormLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900">객실 관리</h2>
          <p className="text-gray-600 mt-1">객실 정보를 추가하고 수정하세요</p>
        </div>
        <button
          onClick={handleCreate}
          className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          객실 추가
        </button>
      </div>

      {/* 로딩 상태 */}
      {loading && (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      )}

      {/* 에러 상태 */}
      {error && (
        <div className="text-center py-8">
          <div className="text-red-500 mb-4">{error}</div>
          <button
            onClick={fetchRooms}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            다시 시도
          </button>
        </div>
      )}

      {/* 객실 목록 - 로딩/에러가 아닐 때만 표시 */}
      {!loading && !error && (
        <>
          {/* 객실 목록 - 데스크톱 테이블 */}
          <div className="hidden lg:block bg-white rounded-lg shadow-sm border overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실명</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">크기</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">수용인원</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">상태</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {rooms.map((room) => (
                    <tr key={room._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(room)}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{room.name}</div>
                        <div className="text-sm text-gray-500">{room.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.roomType}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">₩{room.price?.toLocaleString()}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.size}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{room.capacity}명</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {room.isAvailable ? '예약 가능' : '예약 불가'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(room._id);
                          }}
                          className="text-red-600 hover:text-red-900 transition-colors"
                        >
                          삭제
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {rooms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                객실이 없습니다.
              </div>
            )}
          </div>

          {/* 객실 목록 - 모바일 카드 */}
          <div className="lg:hidden space-y-4">
            {rooms.map((room) => (
              <div key={room._id} className="bg-white rounded-lg shadow-sm border p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{room.name}</h3>
                    <p className="text-sm text-gray-500">{room.description}</p>
                  </div>
                  <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                    room.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {room.isAvailable ? '예약 가능' : '예약 불가'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">타입:</span>
                    <span className="font-medium">{room.roomType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">가격:</span>
                    <span className="font-medium">₩{room.price?.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">크기:</span>
                    <span>{room.size}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">수용인원:</span>
                    <span>{room.capacity}명</span>
                  </div>
                </div>
                
                <div className="flex justify-end space-x-2 mt-4 pt-3 border-t">
                  <button
                    onClick={() => handleRowClick(room)}
                    className="text-blue-600 hover:text-blue-900 transition-colors text-sm"
                  >
                    수정
                  </button>
                  <button
                    onClick={() => handleDelete(room._id)}
                    className="text-red-600 hover:text-red-900 transition-colors text-sm"
                  >
                    삭제
                  </button>
                </div>
              </div>
            ))}
            
            {rooms.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                객실이 없습니다.
              </div>
            )}
          </div>
        </>
      )}

      {/* 수정 모달 */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">객실 수정</h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <RoomForm
                initial={selectedRoom}
                onSubmit={handleUpdateSubmit}
                onCancel={() => setShowModal(false)}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      )}

      {/* 신규 등록 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-4 sm:p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg sm:text-xl font-bold text-gray-900">객실 추가</h3>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <X className="w-5 h-5 sm:w-6 sm:h-6" />
                </button>
              </div>
              <RoomForm
                onSubmit={handleCreateSubmit}
                onCancel={() => setShowCreateModal(false)}
                loading={formLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms; 