import { useState, useEffect } from 'react';
import { Calculator, User, Activity, Target } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface UserData {
  weight: number;
  height: number;
  age: number;
  gender: 'male' | 'female';
  activityLevel: string;
}

export const CalorieCalculator = () => {
  const [userData, setUserData] = useState<UserData>({
    weight: 0,
    height: 0,
    age: 0,
    gender: 'male',
    activityLevel: ''
  });
  
  const [results, setResults] = useState<{
    bmr: number;
    tdee: number;
    bulking: number;
    cutting: number;
  } | null>(null);

  const activityLevels = [
    { value: '1.2', label: 'خامل (مكتبي، بدون رياضة)' },
    { value: '1.375', label: 'نشاط قليل (رياضة خفيفة 1-3 أيام/أسبوع)' },
    { value: '1.55', label: 'نشاط متوسط (رياضة متوسطة 3-5 أيام/أسبوع)' },
    { value: '1.725', label: 'نشاط عالي (رياضة قوية 6-7 أيام/أسبوع)' },
    { value: '1.9', label: 'نشاط عالي جداً (رياضة قوية يومياً + عمل بدني)' }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const saved = localStorage.getItem('user-data');
    if (saved) {
      setUserData(JSON.parse(saved));
    }
  };

  const saveUserData = () => {
    localStorage.setItem('user-data', JSON.stringify(userData));
  };

  const calculateBMR = () => {
    if (!userData.weight || !userData.height || !userData.age) return 0;
    
    // Mifflin-St Jeor Equation
    if (userData.gender === 'male') {
      return 10 * userData.weight + 6.25 * userData.height - 5 * userData.age + 5;
    } else {
      return 10 * userData.weight + 6.25 * userData.height - 5 * userData.age - 161;
    }
  };

  const calculateTDEE = (bmr: number) => {
    if (!userData.activityLevel) return 0;
    return bmr * parseFloat(userData.activityLevel);
  };

  const handleCalculate = () => {
    const bmr = calculateBMR();
    const tdee = calculateTDEE(bmr);
    
    setResults({
      bmr: Math.round(bmr),
      tdee: Math.round(tdee),
      bulking: Math.round(tdee + 300), // +300 calories for bulking
      cutting: Math.round(tdee - 500)  // -500 calories for cutting
    });
    
    saveUserData();
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2 bg-gradient-to-br from-warning to-accent rounded-lg">
          <Calculator className="w-6 h-6 text-foreground" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground">حاسبة السعرات الحرارية</h2>
          <p className="text-sm text-muted-foreground">احسب BMR و TDEE الخاص بك</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="weight">الوزن (كغ)</Label>
              <Input
                id="weight"
                type="number"
                min="1"
                value={userData.weight || ''}
                onChange={(e) => setUserData(prev => ({ ...prev, weight: parseFloat(e.target.value) || 0 }))}
                placeholder="70"
              />
            </div>
            <div>
              <Label htmlFor="height">الطول (سم)</Label>
              <Input
                id="height"
                type="number"
                min="1"
                value={userData.height || ''}
                onChange={(e) => setUserData(prev => ({ ...prev, height: parseFloat(e.target.value) || 0 }))}
                placeholder="175"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="age">العمر</Label>
              <Input
                id="age"
                type="number"
                min="1"
                value={userData.age || ''}
                onChange={(e) => setUserData(prev => ({ ...prev, age: parseInt(e.target.value) || 0 }))}
                placeholder="25"
              />
            </div>
            <div>
              <Label htmlFor="gender">الجنس</Label>
              <Select 
                value={userData.gender} 
                onValueChange={(value: 'male' | 'female') => setUserData(prev => ({ ...prev, gender: value }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">ذكر</SelectItem>
                  <SelectItem value="female">أنثى</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="activity">مستوى النشاط</Label>
            <Select 
              value={userData.activityLevel} 
              onValueChange={(value) => setUserData(prev => ({ ...prev, activityLevel: value }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="اختر مستوى نشاطك" />
              </SelectTrigger>
              <SelectContent>
                {activityLevels.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Button 
            onClick={handleCalculate} 
            className="w-full"
            disabled={!userData.weight || !userData.height || !userData.age || !userData.activityLevel}
          >
            احسب السعرات الحرارية
          </Button>
        </div>

        {results && (
          <div className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <User className="w-4 h-4" />
                  معدل الأيض الأساسي (BMR)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-primary">{results.bmr.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">سعرة حرارية/يوم</div>
                <p className="text-xs text-muted-foreground mt-2">
                  السعرات التي يحتاجها جسمك في حالة الراحة التامة
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-base">
                  <Activity className="w-4 h-4" />
                  إجمالي الإنفاق اليومي (TDEE)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-accent">{results.tdee.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">سعرة حرارية/يوم</div>
                <p className="text-xs text-muted-foreground mt-2">
                  للحفاظ على الوزن الحالي
                </p>
              </CardContent>
            </Card>

            <div className="grid grid-cols-2 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4" />
                    التضخيم
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-success">{results.bulking.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">سعرة/يوم</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <Target className="w-4 h-4" />
                    التنشيف
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-xl font-bold text-warning">{results.cutting.toLocaleString()}</div>
                  <div className="text-xs text-muted-foreground">سعرة/يوم</div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};