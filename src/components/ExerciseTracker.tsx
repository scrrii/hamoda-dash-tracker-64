import { useState, useEffect } from 'react';
import { Plus, Dumbbell, Edit, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Exercise {
  id: string;
  name: string;
  type: string;
  sets: number;
  reps: number;
  weight: number;
  time: string;
  notes?: string;
}

interface ExerciseTrackerProps {
  selectedDate: Date;
}

export const ExerciseTracker = ({ selectedDate }: ExerciseTrackerProps) => {
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    sets: 1,
    reps: 1,
    weight: 0,
    time: '',
    notes: ''
  });

  const exerciseTypes = [
    'صدر', 'ظهر', 'أكتاف', 'ذراع', 'رجل', 'بطن', 'كارديو', 'أخرى'
  ];

  useEffect(() => {
    loadExerciseData();
  }, [selectedDate]);

  const loadExerciseData = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const saved = localStorage.getItem(`exercises-${dateKey}`);
    if (saved) {
      setExercises(JSON.parse(saved));
    } else {
      setExercises([]);
    }
  };

  const saveExerciseData = (updatedExercises: Exercise[]) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    localStorage.setItem(`exercises-${dateKey}`, JSON.stringify(updatedExercises));
    setExercises(updatedExercises);
  };

  const handleSubmit = () => {
    console.log('Form submission started', formData);
    if (!formData.name || !formData.type || !formData.time) {
      console.log('Form validation failed', { name: formData.name, type: formData.type, time: formData.time });
      return;
    }

    const exercise: Exercise = {
      id: editingExercise ? editingExercise.id : Date.now().toString(),
      ...formData
    };

    let updatedExercises;
    if (editingExercise) {
      updatedExercises = exercises.map(ex => ex.id === editingExercise.id ? exercise : ex);
    } else {
      updatedExercises = [...exercises, exercise];
    }

    saveExerciseData(updatedExercises);
    resetForm();
    setIsDialogOpen(false);
  };

  const deleteExercise = (id: string) => {
    const updatedExercises = exercises.filter(ex => ex.id !== id);
    saveExerciseData(updatedExercises);
  };

  const editExercise = (exercise: Exercise) => {
    setEditingExercise(exercise);
    setFormData({
      name: exercise.name,
      type: exercise.type,
      sets: exercise.sets,
      reps: exercise.reps,
      weight: exercise.weight,
      time: exercise.time,
      notes: exercise.notes || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      sets: 1,
      reps: 1,
      weight: 0,
      time: '',
      notes: ''
    });
    setEditingExercise(null);
  };

  const getTotalVolume = () => {
    return exercises.reduce((total, ex) => total + (ex.sets * ex.reps * ex.weight), 0);
  };

  const getWorkoutDuration = () => {
    if (exercises.length === 0) return '0 دقيقة';
    
    const times = exercises.map(ex => ex.time).filter(time => time);
    if (times.length === 0) return '0 دقيقة';
    
    const startTime = times.sort()[0];
    const endTime = times.sort().reverse()[0];
    
    const [startHour, startMin] = startTime.split(':').map(Number);
    const [endHour, endMin] = endTime.split(':').map(Number);
    
    const startMinutes = startHour * 60 + startMin;
    const endMinutes = endHour * 60 + endMin;
    
    const duration = Math.max(30, endMinutes - startMinutes + 30); // Default 30 min per exercise
    
    return `${Math.round(duration)} دقيقة`;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-secondary to-primary rounded-lg">
            <Dumbbell className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">التمارين الرياضية</h2>
            <p className="text-sm text-muted-foreground">سجل تمارينك اليومية</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => {
              console.log('Add exercise button clicked');
              resetForm();
            }} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة تمرين
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingExercise ? 'تعديل التمرين' : 'إضافة تمرين جديد'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">اسم التمرين</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: Push Up"
                />
              </div>

              <div>
                <Label htmlFor="type">نوع التمرين</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع التمرين" />
                  </SelectTrigger>
                  <SelectContent>
                    {exerciseTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="sets">المجموعات</Label>
                  <Input
                    id="sets"
                    type="number"
                    min="1"
                    value={formData.sets}
                    onChange={(e) => setFormData(prev => ({ ...prev, sets: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="reps">التكرارات</Label>
                  <Input
                    id="reps"
                    type="number"
                    min="1"
                    value={formData.reps}
                    onChange={(e) => setFormData(prev => ({ ...prev, reps: parseInt(e.target.value) }))}
                  />
                </div>
                <div>
                  <Label htmlFor="weight">الوزن (كغ)</Label>
                  <Input
                    id="weight"
                    type="number"
                    min="0"
                    step="0.5"
                    value={formData.weight}
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: parseFloat(e.target.value) }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="time">وقت التمرين</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ملاحظات إضافية..."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingExercise ? 'تحديث التمرين' : 'إضافة التمرين'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {exercises.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-primary">{exercises.length}</div>
            <div className="text-sm text-muted-foreground">إجمالي التمارين</div>
          </div>
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-accent">{getTotalVolume().toLocaleString()}</div>
            <div className="text-sm text-muted-foreground">الحمولة الإجمالية (كغ)</div>
          </div>
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-4 rounded-lg">
            <div className="text-2xl font-bold text-secondary">{getWorkoutDuration()}</div>
            <div className="text-sm text-muted-foreground">مدة التمرين</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {exercises.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد تمارين مسجلة لهذا اليوم
          </div>
        ) : (
          exercises.map((exercise) => (
            <div key={exercise.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h3 className="font-semibold text-foreground">{exercise.name}</h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {exercise.type}
                  </span>
                  <div className="flex items-center gap-1 text-muted-foreground text-sm">
                    <Clock className="w-3 h-3" />
                    {exercise.time}
                  </div>
                </div>
                <div className="text-sm text-muted-foreground">
                  {exercise.sets} مجموعات × {exercise.reps} تكرار
                  {exercise.weight > 0 && ` × ${exercise.weight} كغ`}
                  {exercise.notes && (
                    <div className="mt-1 text-xs">{exercise.notes}</div>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editExercise(exercise)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteExercise(exercise.id)}
                  className="text-destructive hover:text-destructive"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};