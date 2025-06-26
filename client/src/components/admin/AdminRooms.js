import React, { useEffect, useState } from 'react';
import { getAdminRooms, createAdminRoom, updateAdminRoom, deleteAdminRoom } from '../../services/api';

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
      <div>
        <label className="block text-sm font-medium">객실명*</label>
        <input name="name" value={form.name} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">간단 설명*</label>
        <input name="description" value={form.description} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">상세 설명</label>
        <textarea name="detailedDescription" value={form.detailedDescription} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">가격(숫자)*</label>
        <input name="price" type="number" value={form.price} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">대표 이미지 URL*</label>
        <input name="image" value={form.image} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">추가 이미지 URL(여러 개는 ,로 구분)</label>
        <input name="images" value={form.images} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">크기*</label>
        <input name="size" value={form.size} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">수용 인원*</label>
        <input name="capacity" type="number" value={form.capacity} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">어메니티(여러 개는 ,로 구분)</label>
        <input name="amenities" value={form.amenities} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">특징(여러 개는 ,로 구분)</label>
        <input name="features" value={form.features} onChange={handleChange} className="w-full border rounded px-2 py-1" />
      </div>
      <div>
        <label className="block text-sm font-medium">타입*</label>
        <select name="roomType" value={form.roomType} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="standard">스탠다드</option>
          <option value="deluxe">디럭스</option>
          <option value="suite">스위트</option>
          <option value="villa">빌라</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium">전망*</label>
        <select name="view" value={form.view} onChange={handleChange} className="w-full border rounded px-2 py-1">
          <option value="garden">가든</option>
          <option value="ocean">오션</option>
          <option value="mountain">마운틴</option>
          <option value="city">시티</option>
        </select>
      </div>
      <div className="flex items-center space-x-2">
        <input name="isAvailable" type="checkbox" checked={form.isAvailable} onChange={handleChange} />
        <label className="text-sm">예약 가능</label>
      </div>
      <div className="flex justify-end space-x-3 mt-4">
        <button type="button" onClick={onCancel} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">취소</button>
        <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700" disabled={loading}>{loading ? '저장 중...' : '저장'}</button>
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
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">객실 관리</h2>
          <p className="text-gray-600 mt-1">객실 정보를 추가하고 수정하세요</p>
        </div>
        <button
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          onClick={handleCreate}
        >
          신규 등록
        </button>
      </div>
      <div className="bg-white rounded-lg shadow-sm border p-6">
        {loading ? (
          <div className="text-center text-gray-500">로딩 중...</div>
        ) : error ? (
          <div className="text-center text-red-500">{error}</div>
        ) : rooms.length === 0 ? (
          <div className="text-center text-gray-500">등록된 객실이 없습니다.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">객실명</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">가격</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">타입</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">예약가능</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">액션</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {rooms.map(room => (
                  <tr key={room._id} className="hover:bg-gray-50 cursor-pointer" onClick={() => handleRowClick(room)}>
                    <td className="px-6 py-4 whitespace-nowrap">{room.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">₩{room.price?.toLocaleString()}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{room.roomType}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{room.isAvailable ? 'Y' : 'N'}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={e => { e.stopPropagation(); handleDelete(room._id); }}
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
        )}
      </div>
      {/* 상세/수정 모달 */}
      {showModal && selectedRoom && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">객실 상세/수정</h3>
            <RoomForm
              initial={selectedRoom}
              onSubmit={handleUpdateSubmit}
              onCancel={() => setShowModal(false)}
              loading={formLoading}
            />
          </div>
        </div>
      )}
      {/* 신규 등록 모달 */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <h3 className="text-xl font-bold mb-4">객실 신규 등록</h3>
            <RoomForm
              onSubmit={handleCreateSubmit}
              onCancel={() => setShowCreateModal(false)}
              loading={formLoading}
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRooms; 