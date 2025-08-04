import { useState, useEffect } from 'react';
import { Plus, Utensils, Edit, Trash2, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface Meal {
  id: string;
  name: string;
  type: string;
  time: string;
  quantity: string;
  calories: number;
  carbs: number;
  protein: number;
  fats: number;
  notes?: string;
}

interface NutritionTrackerProps {
  selectedDate: Date;
}

export const NutritionTracker = ({ selectedDate }: NutritionTrackerProps) => {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState<Meal | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    time: '',
    quantity: '',
    calories: 0,
    carbs: 0,
    protein: 0,
    fats: 0,
    notes: ''
  });

  const mealTypes = ['فطور', 'غداء', 'عشاء', 'سناك', 'مشروب'];

  useEffect(() => {
    loadNutritionData();
  }, [selectedDate]);

  const loadNutritionData = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const saved = localStorage.getItem(`nutrition-${dateKey}`);
    if (saved) {
      setMeals(JSON.parse(saved));
    } else {
      setMeals([]);
    }
  };

  const saveNutritionData = (updatedMeals: Meal[]) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    localStorage.setItem(`nutrition-${dateKey}`, JSON.stringify(updatedMeals));
    setMeals(updatedMeals);
  };

  const handleSubmit = () => {
    if (!formData.name || !formData.type || !formData.time) return;

    const meal: Meal = {
      id: editingMeal ? editingMeal.id : Date.now().toString(),
      ...formData
    };

    let updatedMeals;
    if (editingMeal) {
      updatedMeals = meals.map(m => m.id === editingMeal.id ? meal : m);
    } else {
      updatedMeals = [...meals, meal];
    }

    saveNutritionData(updatedMeals);
    resetForm();
    setIsDialogOpen(false);
  };

  const deleteMeal = (id: string) => {
    const updatedMeals = meals.filter(m => m.id !== id);
    saveNutritionData(updatedMeals);
  };

  const editMeal = (meal: Meal) => {
    setEditingMeal(meal);
    setFormData({
      name: meal.name,
      type: meal.type,
      time: meal.time,
      quantity: meal.quantity,
      calories: meal.calories,
      carbs: meal.carbs,
      protein: meal.protein,
      fats: meal.fats,
      notes: meal.notes || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      name: '',
      type: '',
      time: '',
      quantity: '',
      calories: 0,
      carbs: 0,
      protein: 0,
      fats: 0,
      notes: ''
    });
    setEditingMeal(null);
  };

  const getTotalNutrition = () => {
    return meals.reduce((total, meal) => ({
      calories: total.calories + meal.calories,
      carbs: total.carbs + meal.carbs,
      protein: total.protein + meal.protein,
      fats: total.fats + meal.fats
    }), { calories: 0, carbs: 0, protein: 0, fats: 0 });
  };

  const totals = getTotalNutrition();

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-accent to-accent-glow rounded-lg">
            <Utensils className="w-6 h-6 text-accent-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">الوجبات الغذائية</h2>
            <p className="text-sm text-muted-foreground">تتبع وجباتك وسعراتك الحرارية</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة وجبة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingMeal ? 'تعديل الوجبة' : 'إضافة وجبة جديدة'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="name">اسم الوجبة</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: سلطة خضار"
                />
              </div>

              <div>
                <Label htmlFor="type">نوع الوجبة</Label>
                <Select 
                  value={formData.type} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الوجبة" />
                  </SelectTrigger>
                  <SelectContent>
                    {mealTypes.map((type) => (
                      <SelectItem key={type} value={type}>{type}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="time">الوقت</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="quantity">الكمية</Label>
                  <Input
                    id="quantity"
                    value={formData.quantity}
                    onChange={(e) => setFormData(prev => ({ ...prev, quantity: e.target.value }))}
                    placeholder="200غ"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="calories">السعرات (kcal)</Label>
                  <Input
                    id="calories"
                    type="number"
                    min="0"
                    value={formData.calories}
                    onChange={(e) => setFormData(prev => ({ ...prev, calories: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="carbs">الكربوهيدرات (غ)</Label>
                  <Input
                    id="carbs"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.carbs}
                    onChange={(e) => setFormData(prev => ({ ...prev, carbs: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="protein">البروتين (غ)</Label>
                  <Input
                    id="protein"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.protein}
                    onChange={(e) => setFormData(prev => ({ ...prev, protein: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="fats">الدهون (غ)</Label>
                  <Input
                    id="fats"
                    type="number"
                    min="0"
                    step="0.1"
                    value={formData.fats}
                    onChange={(e) => setFormData(prev => ({ ...prev, fats: parseFloat(e.target.value) || 0 }))}
                  />
                </div>
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
                {editingMeal ? 'تحديث الوجبة' : 'إضافة الوجبة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {meals.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-gradient-to-r from-accent/10 to-primary/10 p-3 rounded-lg">
            <div className="text-xl font-bold text-accent">{totals.calories}</div>
            <div className="text-xs text-muted-foreground">السعرات</div>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-secondary/10 p-3 rounded-lg">
            <div className="text-xl font-bold text-primary">{totals.carbs.toFixed(1)}غ</div>
            <div className="text-xs text-muted-foreground">الكربوهيدرات</div>
          </div>
          <div className="bg-gradient-to-r from-secondary/10 to-accent/10 p-3 rounded-lg">
            <div className="text-xl font-bold text-secondary">{totals.protein.toFixed(1)}غ</div>
            <div className="text-xs text-muted-foreground">البروتين</div>
          </div>
          <div className="bg-gradient-to-r from-warning/10 to-accent/10 p-3 rounded-lg">
            <div className="text-xl font-bold text-warning">{totals.fats.toFixed(1)}غ</div>
            <div className="text-xs text-muted-foreground">الدهون</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {meals.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد وجبات مسجلة لهذا اليوم
          </div>
        ) : (
          meals
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((meal) => (
              <div key={meal.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{meal.name}</h3>
                    <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">
                      {meal.type}
                    </span>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="w-3 h-3" />
                      {meal.time}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {meal.quantity} • {meal.calories} سعرة حرارية
                    {meal.notes && (
                      <div className="mt-1 text-xs">{meal.notes}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editMeal(meal)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteMeal(meal.id)}
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