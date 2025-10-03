import React from 'react';
import { User, Mail, Phone, Calendar, Trash2 } from 'lucide-react';
import { Participant } from '../../types';
import Card from '../ui/Card';

interface ParticipantListProps {
  participants: Participant[];
  onDelete: (id: string) => void;
}

const ParticipantList: React.FC<ParticipantListProps> = ({ participants, onDelete }) => {
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Not provided';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (participants.length === 0) {
    return (
      <Card className="text-center py-12">
        <User className="mx-auto text-gray-400 mb-3" size={48} />
        <p className="text-gray-500">No participants yet. Add your first participant to get started.</p>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {participants.map((participant) => (
        <Card key={participant.id} className="hover:shadow-lg transition-shadow">
          <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                <User className="text-blue-600" size={20} />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{participant.name}</h3>
              </div>
            </div>
            <button
              onClick={() => onDelete(participant.id)}
              className="text-gray-400 hover:text-red-500 transition-colors"
              title="Delete participant"
            >
              <Trash2 size={18} />
            </button>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2 text-gray-600">
              <Mail size={16} />
              <span className="truncate">{participant.email}</span>
            </div>

            {participant.mobile && (
              <div className="flex items-center gap-2 text-gray-600">
                <Phone size={16} />
                <span>{participant.mobile}</span>
              </div>
            )}

            <div className="flex items-center gap-2 text-gray-600">
              <Calendar size={16} />
              <span>{formatDate(participant.date_of_birth)}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

export default ParticipantList;
