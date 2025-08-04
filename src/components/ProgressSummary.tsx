import { useState, useEffect } from 'react';
import { TrendingUp, Calendar, Award, Target } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface ProgressSummaryProps {
  selectedDate: Date;
}

export const ProgressSummary = ({ selectedDate }: ProgressSummaryProps) => {
  const [weeklyStats, setWeeklyStats] = useState({
    prayers: { completed: 0, total: 0 },
    exercises: 0,
    meals: 0,
    study: 0,
    words: 0,
    tasks: { completed: 0, total: 0 }
  });

  const [monthlyStats, setMonthlyStats] = useState({
    prayers: { completed: 0, total: 0 },
    exercises: 0,
    meals: 0,
    study: 0,
    words: 0,
    tasks: { completed: 0, total: 0 }
  });

  useEffect(() => {
    calculateWeeklyStats();
    calculateMonthlyStats();
  }, [selectedDate]);

  const getWeekDates = () => {
    const dates = [];
    const start = new Date(selectedDate);
    const day = start.getDay();
    start.setDate(start.getDate() - day); // Start from Sunday

    for (let i = 0; i < 7; i++) {
      const date = new Date(start);
      date.setDate(start.getDate() + i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const getMonthDates = () => {
    const dates = [];
    const year = selectedDate.getFullYear();
    const month = selectedDate.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      dates.push(date.toISOString().split('T')[0]);
    }
    return dates;
  };

  const calculateWeeklyStats = () => {
    const weekDates = getWeekDates();
    let prayers = { completed: 0, total: 0 };
    let exercises = 0;
    let meals = 0;
    let study = 0;
    let words = 0;
    let tasks = { completed: 0, total: 0 };

    weekDates.forEach(date => {
      // Prayers
      const prayersData = localStorage.getItem(`prayers-${date}`);
      if (prayersData) {
        const dailyPrayers = JSON.parse(prayersData);
        prayers.total += dailyPrayers.length;
        prayers.completed += dailyPrayers.filter((p: any) => p.isPrayed).length;
      }

      // Exercises
      const exercisesData = localStorage.getItem(`exercises-${date}`);
      if (exercisesData) {
        exercises += JSON.parse(exercisesData).length;
      }

      // Meals
      const mealsData = localStorage.getItem(`nutrition-${date}`);
      if (mealsData) {
        meals += JSON.parse(mealsData).length;
      }

      // Study sessions
      const studyData = localStorage.getItem(`study-${date}`);
      if (studyData) {
        study += JSON.parse(studyData).length;
      }

      // Tasks
      const tasksData = localStorage.getItem(`tasks-${date}`);
      if (tasksData) {
        const dailyTasks = JSON.parse(tasksData);
        tasks.total += dailyTasks.length;
        tasks.completed += dailyTasks.filter((t: any) => t.isCompleted).length;
      }
    });

    // German words (from all saved words this week)
    const allWordsData = localStorage.getItem('german-words-all');
    if (allWordsData) {
      const allWords = JSON.parse(allWordsData);
      words = allWords.filter((word: any) => weekDates.includes(word.date)).length;
    }

    setWeeklyStats({ prayers, exercises, meals, study, words, tasks });
  };

  const calculateMonthlyStats = () => {
    const monthDates = getMonthDates();
    let prayers = { completed: 0, total: 0 };
    let exercises = 0;
    let meals = 0;
    let study = 0;
    let words = 0;
    let tasks = { completed: 0, total: 0 };

    monthDates.forEach(date => {
      // Prayers
      const prayersData = localStorage.getItem(`prayers-${date}`);
      if (prayersData) {
        const dailyPrayers = JSON.parse(prayersData);
        prayers.total += dailyPrayers.length;
        prayers.completed += dailyPrayers.filter((p: any) => p.isPrayed).length;
      }

      // Exercises
      const exercisesData = localStorage.getItem(`exercises-${date}`);
      if (exercisesData) {
        exercises += JSON.parse(exercisesData).length;
      }

      // Meals
      const mealsData = localStorage.getItem(`nutrition-${date}`);
      if (mealsData) {
        meals += JSON.parse(mealsData).length;
      }

      // Study sessions
      const studyData = localStorage.getItem(`study-${date}`);
      if (studyData) {
        study += JSON.parse(studyData).length;
      }

      // Tasks
      const tasksData = localStorage.getItem(`tasks-${date}`);
      if (tasksData) {
        const dailyTasks = JSON.parse(tasksData);
        tasks.total += dailyTasks.length;
        tasks.completed += dailyTasks.filter((t: any) => t.isCompleted).length;
      }
    });

    // German words (from all saved words this month)
    const allWordsData = localStorage.getItem('german-words-all');
    if (allWordsData) {
      const allWords = JSON.parse(allWordsData);
      words = allWords.filter((word: any) => monthDates.includes(word.date)).length;
    }

    setMonthlyStats({ prayers, exercises, meals, study, words, tasks });
  };

  const getOverallWeeklyPercentage = () => {
    const totalActivities = weeklyStats.prayers.total + weeklyStats.exercises + weeklyStats.study + weeklyStats.tasks.total;
    const completedActivities = weeklyStats.prayers.completed + weeklyStats.exercises + weeklyStats.study + weeklyStats.tasks.completed;
    
    if (totalActivities === 0) return 0;
    return Math.round((completedActivities / totalActivities) * 100);
  };

  const getOverallMonthlyPercentage = () => {
    const totalActivities = monthlyStats.prayers.total + monthlyStats.exercises + monthlyStats.study + monthlyStats.tasks.total;
    const completedActivities = monthlyStats.prayers.completed + monthlyStats.exercises + monthlyStats.study + monthlyStats.tasks.completed;
    
    if (totalActivities === 0) return 0;
    return Math.round((completedActivities / totalActivities) * 100);
  };

  const getMotivationalMessage = (percentage: number) => {
    if (percentage >= 90) return "ممتاز! أنت في المقدمة 🏆";
    if (percentage >= 80) return "رائع! استمر في هذا المعدل 🌟";
    if (percentage >= 70) return "جيد جداً! يمكنك تحسين أكثر 💪";
    if (percentage >= 60) return "جيد! تحتاج لمزيد من التركيز 📈";
    if (percentage >= 50) return "متوسط، يمكنك فعل أفضل من ذلك 🎯";
    return "ابدأ من جديد! كل يوم فرصة جديدة 🌅";
  };

  return (
    <div className="space-y-6">
      {/* Weekly Summary */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            ملخص الأسبوع
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">
                {weeklyStats.prayers.total > 0 ? Math.round((weeklyStats.prayers.completed / weeklyStats.prayers.total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">الصلوات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{weeklyStats.exercises}</div>
              <div className="text-sm text-muted-foreground">تمارين</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{weeklyStats.meals}</div>
              <div className="text-sm text-muted-foreground">وجبات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{weeklyStats.study}</div>
              <div className="text-sm text-muted-foreground">جلسات دراسية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{weeklyStats.words}</div>
              <div className="text-sm text-muted-foreground">كلمات ألمانية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {weeklyStats.tasks.total > 0 ? Math.round((weeklyStats.tasks.completed / weeklyStats.tasks.total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">المهام</div>
            </div>
          </div>
          
          <div className="bg-primary/10 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">الإنجاز الأسبوعي</span>
              <span className="text-xl font-bold text-primary">{getOverallWeeklyPercentage()}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-primary to-accent h-2 rounded-full divine-transition"
                style={{ width: `${getOverallWeeklyPercentage()}%` }}
              ></div>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              {getMotivationalMessage(getOverallWeeklyPercentage())}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Monthly Summary */}
      <Card className="bg-gradient-to-r from-secondary/5 to-primary/5 border-secondary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-secondary" />
            ملخص الشهر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">
                {monthlyStats.prayers.total > 0 ? Math.round((monthlyStats.prayers.completed / monthlyStats.prayers.total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">الصلوات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{monthlyStats.exercises}</div>
              <div className="text-sm text-muted-foreground">تمارين</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">{monthlyStats.meals}</div>
              <div className="text-sm text-muted-foreground">وجبات</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-secondary">{monthlyStats.study}</div>
              <div className="text-sm text-muted-foreground">جلسات دراسية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{monthlyStats.words}</div>
              <div className="text-sm text-muted-foreground">كلمات ألمانية</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-accent">
                {monthlyStats.tasks.total > 0 ? Math.round((monthlyStats.tasks.completed / monthlyStats.tasks.total) * 100) : 0}%
              </div>
              <div className="text-sm text-muted-foreground">المهام</div>
            </div>
          </div>
          
          <div className="bg-secondary/10 p-4 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">الإنجاز الشهري</span>
              <span className="text-xl font-bold text-secondary">{getOverallMonthlyPercentage()}%</span>
            </div>
            <div className="w-full bg-muted rounded-full h-2 mb-2">
              <div 
                className="bg-gradient-to-r from-secondary to-primary h-2 rounded-full divine-transition"
                style={{ width: `${getOverallMonthlyPercentage()}%` }}
              ></div>
            </div>
            <div className="text-sm text-center text-muted-foreground">
              {getMotivationalMessage(getOverallMonthlyPercentage())}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Journey to November */}
      <Card className="bg-gradient-to-r from-accent/5 to-warning/5 border-accent/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-accent" />
            رحلة التطوير حتى نهاية أكتوبر
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center">
            <div className="text-lg font-semibold mb-2">
              تبقى على الهدف النهائي
            </div>
            <div className="text-3xl font-bold text-accent mb-2">
              {Math.ceil((new Date('2025-10-31').getTime() - selectedDate.getTime()) / (1000 * 60 * 60 * 24))} يوم
            </div>
            <div className="text-sm text-muted-foreground mb-4">
              استمر في رحلتك لتصبح أفضل نسخة من نفسك
            </div>
            <div className="bg-accent/10 p-3 rounded-lg">
              <div className="text-sm font-medium text-accent">
                "كل يوم خطوة نحو هدفك الكبير"
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};