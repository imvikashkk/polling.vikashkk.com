'use client';

import { useSocketActions } from '@/hooks/useSocketAction';
import { useAppSelector } from '@/store';
import { selectUserRole } from '@/store/slices/userSlice';
import { Student } from '@/types';

interface StudentsListProps {
  students: Student[];
}

export const StudentsList: React.FC<StudentsListProps> = ({ students }) => {
  const { kickStudent } = useSocketActions();
  const userRole = useAppSelector(selectUserRole);

  const handleKick = (studentId: string, studentName: string) => {
    if (
      confirm(
        `Are you sure you want to remove ${studentName} from the session?`
      )
    ) {
      kickStudent(studentId);
    }
  };

  return (
    <div className="flex-1 h-107.5 rounded-br-sm rounded-bl-sm">
      <div className="h-full overflow-y-auto">
        {students.length === 0 ? (
          <div className="p-8 text-center h-[80%] flex flex-col items-center justify-center">
            <div className="inline-block p-4 bg-gray-100 rounded-full mb-3">
              <span className="text-3xl">👥</span>
            </div>
            <p className="text-gray-600">No students yet</p>
            <p className="text-sm text-gray-500 mt-1">
              Students will appear here when they join
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {students.map((student) => (
              <div
                key={student.id}
                className="p-4 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-[#000000] truncate leading-[95%]">
                        {student.name}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <div
                          className={`h-2 w-2 rounded-full ${
                            student.hasAnswered ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        />
                        <span className="text-xs text-gray-500">
                          {student.hasAnswered ? 'Answered' : 'Not answered'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {userRole === 'teacher' && (
                    <button
                      onClick={() => {
                        if (
                          confirm(
                            `Are you sure you want to remove ${student.name}?`
                          )
                        ) {
                          handleKick(student.id, student.name);
                        }
                      }}
                      className="text-[18px] underline font-semibold text-[#1D68BD] cursor-pointer"
                      title="Remove student"
                    >
                      Kick Out
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
