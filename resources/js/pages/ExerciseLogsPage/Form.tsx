import { Button } from '@/components/ui/button';
import AppLayout from '@/layouts/app-layout';
import { Head, router } from '@inertiajs/react';
import { useState, useMemo } from 'react';
import { route } from 'ziggy-js';

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

export default function Form({ assignment }: Props) {
  const [exercises, setExercises] = useState<Exercise[]>(assignment.exercises);

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

  // Compute status and progress
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

      <div className="p-4 space-y-6">
        <div className="space-y-1">
          <div>
            <strong>Program:</strong> {assignment.program_name}
          </div>
          <div>
            <strong>Coach:</strong> {assignment.coach_name}
          </div>

          <div className="flex items-center gap-2 mt-2">
            <strong>Status:</strong>
            <span>{status}</span>
            <div className="flex-1 h-2 bg-gray-200 rounded overflow-hidden">
              <div
                className={`h-2 rounded transition-all duration-500 ease-in-out ${
                  status === 'Completed'
                    ? 'bg-green-500'
                    : status === 'In-Progress'
                    ? 'bg-yellow-400'
                    : 'bg-gray-400'
                }`}
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <span className="text-sm">{progressPercentage}%</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {exercises.map((exercise) => (
            <div key={exercise.id} className="rounded-lg border p-4 space-y-3">
              <h2 className="text-lg font-bold">{exercise.name}</h2>
              {exercise.description && (
                <p className="text-sm text-gray-500">{exercise.description}</p>
              )}

              <table className="w-full table-auto border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100 border-b border-gray-300">
                    <th className="border px-2 py-1">SET</th>
                    {exercise.sets[0]?.fields.map((field, idx) => {
                      const unit = exercise.sets[0]?.suggested_values?.[idx]?.unit;
                      return (
                        <th key={field.name} className="border px-2 py-1">
                          {unit ? `${field.name.toUpperCase()} (${unit})` : field.name.toUpperCase()}
                        </th>
                      );
                    })}
                    <th className="border px-2 py-1">Mark as Done</th>
                  </tr>
                </thead>

                <tbody>
                  {exercise.sets.map((set) => (
                    <tr
                      key={set.id}
                      className={set.marked_as_done ? 'bg-green-100 transition-colors duration-300' : ''}
                    >
                      <td className="border px-2 py-1 text-center">{set.order + 1}</td>

                      {set.fields.map((field, idx) => {
                        const fieldName = field.name;
                        const unit = set.suggested_values?.[idx]?.unit;

                        // Strip unit for frontend display
                        const rawValue = set.values?.[fieldName] ?? '';
                        const displayValue =
                          unit && typeof rawValue === 'string' && rawValue.endsWith(unit)
                            ? rawValue.slice(0, -unit.length).trim()
                            : rawValue;

                        return (
                          <td key={fieldName} className="border px-2 py-1">
                            <input
                              type="text"
                              value={displayValue}
                              placeholder={set.suggested_values?.[idx]?.value ?? ''}
                              onChange={(e) =>
                                handleInputChange(exercise.id, set.id, fieldName, e.target.value)
                              }
                              className="w-full border rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-primary transition"
                            />
                          </td>
                        );
                      })}

                      <td className="border px-2 py-1 text-center">
                        <input
                          type="checkbox"
                          checked={set.marked_as_done}
                          onChange={() => handleToggleDone(exercise.id, set.id)}
                          className="cursor-pointer"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))}

          <div className="flex gap-4">
            <Button type="submit">Save Changes</Button>
            <Button type="button" variant="outline" onClick={() => window.history.back()}>
              Back
            </Button>
          </div>
        </form>
      </div>
    </AppLayout>
  );
}
