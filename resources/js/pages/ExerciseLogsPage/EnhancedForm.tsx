import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { route } from 'ziggy-js';
import SelectInput from '@/components/FormInputs/SelectInput';

interface ExerciseSet {
  id: number;
  order: number;
  fields: { name: string; type?: string }[];
  values: Record<string, any>;
  suggested_values: { value: string; unit?: string | null }[];
  marked_as_done: boolean;
}

interface Exercise {
  id: number;
  name: string;
  description?: string;
  sets: ExerciseSet[];
}

type Status = 'Assigned' | 'In-Progress' | 'Completed';

interface Assignment {
  id: number;
  student_id: number;
  program_name: string;
  coach_name: string;
  status: Status;
  exercises: Exercise[];
}

interface Props {
  assignment: Assignment;
}

export default function EnhancedForm({ assignment }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>(assignment.exercises);
  const [expandedExercises, setExpandedExercises] = useState<Set<number>>(
    new Set(assignment.exercises.map((ex) => ex.id))
  );

  const handleInputChange = (
    exerciseId: number,
    setId: number,
    fieldName: string,
    value: any
  ) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id !== setId ? s : { ...s, values: { ...s.values, [fieldName]: value } }
            ),
          }
      )
    );
  };

  const handleToggleDone = (exerciseId: number, setId: number) => {
    setExercises((prev) =>
      prev.map((ex) =>
        ex.id !== exerciseId
          ? ex
          : {
            ...ex,
            sets: ex.sets.map((s) =>
              s.id !== setId ? s : { ...s, marked_as_done: !s.marked_as_done }
            ),
          }
      )
    );
  };

  const toggleExerciseExpand = (exerciseId: number) => {
    setExpandedExercises((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(exerciseId)) {
        newSet.delete(exerciseId);
      } else {
        newSet.add(exerciseId);
      }
      return newSet;
    });
  };

  const { status, progressPercentage } = useMemo(() => {
    const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
    const completedSets = exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => s.marked_as_done).length,
      0
    );
    const loggedSets = exercises.reduce(
      (acc, ex) => acc + ex.sets.filter((s) => Object.keys(s.values).length).length,
      0
    );

    let s: Status = 'Assigned';
    if (totalSets === 0 || loggedSets === 0) s = 'Assigned';
    else if (completedSets === totalSets) s = 'Completed';
    else s = 'In-Progress';

    const progress = totalSets === 0 ? 0 : Math.round((completedSets / totalSets) * 100);

    return { status: s, progressPercentage: progress };
  }, [exercises]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const payload = {
      logs: exercises.flatMap((ex) =>
        ex.sets.map((s) => ({
          set_id: s.id,
          inputs: s.values,
          marked_as_done: s.marked_as_done,
        }))
      ),
    };
    router.post(route('exercise-logs.store', assignment.id), payload);
  };

  return (
    <AppLayout
      breadcrumbs={[
        { title: 'Exercise Logs', href: route('exercise-logs.index') },
        { title: assignment.program_name, href: '#' },
      ]}
    >
      <Head title={`Log Exercises: ${assignment.program_name}`} />

      <div className="p-6 max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-4 bg-white dark:bg-[#1a1a1a] rounded-lg border border-[#eaeaea] dark:border-[#2a2a2a] p-6">
          <div>
            <h1 className="text-2xl font-bold text-[#102d4e] dark:text-[#EDEDEC]">
              {assignment.program_name}
            </h1>
            <p className="text-sm text-[#4a4a45] dark:text-[#bcbcb7] mt-1">
              Coach: <span className="font-semibold">{assignment.coach_name}</span>
            </p>
          </div>

          {/* Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-[#1b1b18] dark:text-[#EDEDEC]">
                Progress
              </span>
              <span className="text-sm font-semibold text-[#102d4e] dark:text-[#4a7ba7]">
                {progressPercentage}%
              </span>
            </div>
            <div className="h-3 bg-[#e0e0e0] rounded-full overflow-hidden dark:bg-[#333]">
              <div
                className={`h-3 rounded-full transition-all duration-500 ${
                  status === 'Completed'
                    ? 'bg-green-500'
                    : status === 'In-Progress'
                    ? 'bg-blue-500'
                    : 'bg-gray-400'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>

          {/* Status Badge */}
          <div className="inline-block">
            <span
              className={`px-3 py-1 rounded-full text-xs font-semibold ${
                status === 'Completed'
                  ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300'
                  : status === 'In-Progress'
                  ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300'
                  : 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-300'
              }`}
            >
              {status}
            </span>
          </div>
        </div>

        {/* Exercises Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {exercises.map((exercise) => {
            const isExpanded = expandedExercises.has(exercise.id);
            const exerciseCompletedSets = exercise.sets.filter((s) => s.marked_as_done).length;
            const exerciseTotalSets = exercise.sets.length;

            return (
              <div
                key={exercise.id}
                className="rounded-lg border border-[#eaeaea] dark:border-[#2a2a2a] overflow-hidden bg-white dark:bg-[#1a1a1a]"
              >
                {/* Exercise Header */}
                <button
                  type="button"
                  onClick={() => toggleExerciseExpand(exercise.id)}
                  className="w-full px-6 py-4 flex items-center justify-between hover:bg-[#f5f5f5] dark:hover:bg-[#2a2a2a] transition"
                >
                  <div className="flex items-center gap-4 flex-1 text-left">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#102d4e] dark:text-[#EDEDEC]">
                        {exercise.name}
                      </h3>
                      {exercise.description && (
                        <p className="text-sm text-[#7a7a75] dark:text-[#a5a5a0] mt-1">
                          {exercise.description}
                        </p>
                      )}
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-[#102d4e] dark:text-[#4a7ba7]">
                        {exerciseCompletedSets}/{exerciseTotalSets}
                      </div>
                      <div className="text-xs text-[#7a7a75] dark:text-[#a5a5a0]">
                        sets done
                      </div>
                    </div>
                  </div>
                  <svg
                    className={`w-5 h-5 text-[#7a7a75] dark:text-[#a5a5a0] transition-transform ${
                      isExpanded ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 14l-7 7m0 0l-7-7m7 7V3"
                    />
                  </svg>
                </button>

                {/* Exercise Content */}
                {isExpanded && (
                  <div className="border-t border-[#eaeaea] dark:border-[#2a2a2a] px-6 py-4 space-y-4">
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="border-b border-[#eaeaea] dark:border-[#2a2a2a]">
                            <th className="px-3 py-2 text-left font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                              SET
                            </th>
                            {exercise.sets[0]?.fields.map((field, idx) => {
                              const unit = exercise.sets[0]?.suggested_values?.[idx]?.unit;
                              return (
                                <th
                                  key={field.name}
                                  className="px-3 py-2 text-left font-semibold text-[#1b1b18] dark:text-[#EDEDEC]"
                                >
                                  {unit ? `${field.name} (${unit})` : field.name}
                                </th>
                              );
                            })}
                            <th className="px-3 py-2 text-center font-semibold text-[#1b1b18] dark:text-[#EDEDEC]">
                              Done
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {exercise.sets.map((set) => (
                            <tr
                              key={set.id}
                              className={`border-b border-[#eaeaea] dark:border-[#2a2a2a] transition ${
                                set.marked_as_done
                                  ? 'bg-green-50 dark:bg-green-900/10'
                                  : 'hover:bg-[#f9f9f9] dark:hover:bg-[#2a2a2a]'
                              }`}
                            >
                              <td className="px-3 py-3 font-semibold text-[#102d4e] dark:text-[#4a7ba7]">
                                {set.order + 1}
                              </td>

                              {set.fields.map((field, idx) => {
                                const fieldName = field.name;
                                const unit = set.suggested_values?.[idx]?.unit;
                                const rawValue = set.values?.[fieldName] ?? '';
                                const displayValue =
                                  unit && typeof rawValue === 'string' && rawValue.endsWith(unit)
                                    ? rawValue.slice(0, -unit.length).trim()
                                    : rawValue;

                                return (
                                  <td key={fieldName} className="px-3 py-3">
                                    <input
                                      type="text"
                                      value={displayValue}
                                      placeholder={set.suggested_values?.[idx]?.value ?? ''}
                                      onChange={(e) =>
                                        handleInputChange(exercise.id, set.id, fieldName, e.target.value)
                                      }
                                      className="w-full rounded border border-[#ccc] bg-white px-2 py-1 text-sm text-[#1b1b18] focus:ring-2 focus:ring-[#102d4e] focus:outline-none dark:border-[#444] dark:bg-[#0f0f0f] dark:text-[#EDEDEC]"
                                    />
                                  </td>
                                );
                              })}

                              <td className="px-3 py-3 text-center">
                                <input
                                  type="checkbox"
                                  checked={set.marked_as_done}
                                  onChange={() => handleToggleDone(exercise.id, set.id)}
                                  className="w-5 h-5 cursor-pointer accent-green-500"
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="submit"
              className="flex-1 rounded-md bg-[#102d4e] px-4 py-2 font-semibold text-white transition hover:bg-[#0d243d] focus:ring-2 focus:ring-[#102d4e] focus:outline-none"
            >
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => window.history.back()}
              className="rounded-md border border-[#ccc] px-4 py-2 font-semibold text-[#1b1b18] transition hover:bg-[#f5f5f5] dark:border-[#444] dark:text-[#EDEDEC] dark:hover:bg-[#2a2a2a]"
            >
              Back
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
