import { useState, useEffect } from 'react';
import { Plus, CheckSquare, Square, Edit, Trash2, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Task {
  id: string;
  title: string;
  category: string;
  description?: string;
  isCompleted: boolean;
  isRecurring: boolean;
}

interface TaskManagerProps {
  selectedDate: Date;
}

export const TaskManager = ({ selectedDate }: TaskManagerProps) => {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    category: '',
    description: '',
    isRecurring: false
  });

  const categories = [
    'صلاة', 'رياضة', 'دراسة', 'أكل', 'كلمات ألمانية', 'عمل', 'شخصي', 'صحة', 'أخرى'
  ];

  useEffect(() => {
    loadTasksData();
  }, [selectedDate]);

  const loadTasksData = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    
    // Load today's tasks
    const saved = localStorage.getItem(`tasks-${dateKey}`);
    let todayTasks = saved ? JSON.parse(saved) : [];
    
    // Check if we need to add recurring tasks
    const lastProcessedDate = localStorage.getItem('last-processed-date');
    if (lastProcessedDate !== dateKey) {
      // Load recurring tasks from previous days
      const recurringTasks = getRecurringTasks();
      const newRecurringTasks = recurringTasks.map(task => ({
        ...task,
        id: `${task.id}-${dateKey}`,
        isCompleted: false
      }));
      
      todayTasks = [...todayTasks, ...newRecurringTasks];
      localStorage.setItem(`tasks-${dateKey}`, JSON.stringify(todayTasks));
      localStorage.setItem('last-processed-date', dateKey);
    }
    
    setTasks(todayTasks);
  };

  const getRecurringTasks = (): Task[] => {
    const recurringTasksStr = localStorage.getItem('recurring-tasks');
    return recurringTasksStr ? JSON.parse(recurringTasksStr) : [];
  };

  const saveRecurringTasks = (tasks: Task[]) => {
    localStorage.setItem('recurring-tasks', JSON.stringify(tasks));
  };

  const saveTasksData = (updatedTasks: Task[]) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    localStorage.setItem(`tasks-${dateKey}`, JSON.stringify(updatedTasks));
    setTasks(updatedTasks);
  };

  const handleSubmit = () => {
    if (!formData.title || !formData.category) return;

    const task: Task = {
      id: editingTask ? editingTask.id : Date.now().toString(),
      title: formData.title,
      category: formData.category,
      description: formData.description,
      isCompleted: editingTask ? editingTask.isCompleted : false,
      isRecurring: formData.isRecurring
    };

    let updatedTasks;
    if (editingTask) {
      updatedTasks = tasks.map(t => t.id === editingTask.id ? task : t);
    } else {
      updatedTasks = [...tasks, task];
    }

    saveTasksData(updatedTasks);

    // Handle recurring tasks
    if (formData.isRecurring && !editingTask) {
      const recurringTasks = getRecurringTasks();
      const newRecurringTask = { ...task, id: `recurring-${task.id}` };
      saveRecurringTasks([...recurringTasks, newRecurringTask]);
    } else if (editingTask && editingTask.isRecurring !== formData.isRecurring) {
      const recurringTasks = getRecurringTasks();
      if (formData.isRecurring) {
        // Add to recurring
        const newRecurringTask = { ...task, id: `recurring-${task.id}` };
        saveRecurringTasks([...recurringTasks, newRecurringTask]);
      } else {
        // Remove from recurring
        const filtered = recurringTasks.filter(t => !t.id.includes(editingTask.id));
        saveRecurringTasks(filtered);
      }
    }

    resetForm();
    setIsDialogOpen(false);
  };

  const toggleTaskCompletion = (id: string) => {
    const updatedTasks = tasks.map(task =>
      task.id === id ? { ...task, isCompleted: !task.isCompleted } : task
    );
    saveTasksData(updatedTasks);
  };

  const deleteTask = (id: string) => {
    const task = tasks.find(t => t.id === id);
    const updatedTasks = tasks.filter(t => t.id !== id);
    saveTasksData(updatedTasks);

    // Remove from recurring if it was recurring
    if (task?.isRecurring) {
      const recurringTasks = getRecurringTasks();
      const filtered = recurringTasks.filter(t => !t.id.includes(id));
      saveRecurringTasks(filtered);
    }
  };

  const editTask = (task: Task) => {
    setEditingTask(task);
    setFormData({
      title: task.title,
      category: task.category,
      description: task.description || '',
      isRecurring: task.isRecurring
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      title: '',
      category: '',
      description: '',
      isRecurring: false
    });
    setEditingTask(null);
  };

  const getCompletionStats = () => {
    const total = tasks.length;
    const completed = tasks.filter(t => t.isCompleted).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const getTasksByCategory = () => {
    return tasks.reduce((acc, task) => {
      if (!acc[task.category]) {
        acc[task.category] = { total: 0, completed: 0 };
      }
      acc[task.category].total++;
      if (task.isCompleted) {
        acc[task.category].completed++;
      }
      return acc;
    }, {} as Record<string, { total: number; completed: number }>);
  };

  const stats = getCompletionStats();
  const categoryStats = getTasksByCategory();

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent to-primary rounded-lg">
            <Target className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">المهام اليومية</h2>
            <p className="text-sm text-muted-foreground">إدارة مهامك وأهدافك</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة مهمة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingTask ? 'تعديل المهمة' : 'إضافة مهمة جديدة'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">عنوان المهمة</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  placeholder="مثال: قراءة 10 صفحات"
                />
              </div>

              <div>
                <Label htmlFor="category">الفئة</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر فئة المهمة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>{category}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="description">وصف المهمة</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="تفاصيل إضافية..."
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="recurring"
                  checked={formData.isRecurring}
                  onChange={(e) => setFormData(prev => ({ ...prev, isRecurring: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="recurring" className="text-sm">
                  مهمة متكررة يومياً
                </Label>
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingTask ? 'تحديث المهمة' : 'إضافة المهمة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {tasks.length > 0 && (
        <div className="mb-6">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-4 rounded-lg mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">نسبة الإنجاز اليومية</span>
              <span className="text-2xl font-bold text-primary">{stats.percentage}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full divine-transition"
                style={{ width: `${stats.percentage}%` }}
              ></div>
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {stats.completed} من {stats.total} مهام مكتملة
            </div>
          </div>

          {Object.keys(categoryStats).length > 1 && (
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
              {Object.entries(categoryStats).map(([category, stat]) => (
                <div key={category} className="bg-muted/30 p-3 rounded-lg">
                  <div className="text-sm font-medium">{category}</div>
                  <div className="text-xs text-muted-foreground">
                    {stat.completed}/{stat.total}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="space-y-2">
        {tasks.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد مهام مسجلة لهذا اليوم
          </div>
        ) : (
          tasks.map((task) => (
            <div key={task.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
              <button
                onClick={() => toggleTaskCompletion(task.id)}
                className="divine-transition"
              >
                {task.isCompleted ? (
                  <CheckSquare className="w-5 h-5 text-success" />
                ) : (
                  <Square className="w-5 h-5 text-muted-foreground" />
                )}
              </button>

              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className={`font-medium ${task.isCompleted ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {task.title}
                  </h3>
                  <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                    {task.category}
                  </span>
                  {task.isRecurring && (
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                      متكررة
                    </span>
                  )}
                </div>
                {task.description && (
                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                )}
              </div>

              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => editTask(task)}
                >
                  <Edit className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteTask(task.id)}
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