import { useState, useEffect } from 'react';
import { Plus, GraduationCap, Edit, Trash2, Clock, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface StudySession {
  id: string;
  subject: string;
  duration: string;
  pages: number;
  lessons: number;
  time: string;
  notes?: string;
}

interface StudyTrackerProps {
  selectedDate: Date;
}

export const StudyTracker = ({ selectedDate }: StudyTrackerProps) => {
  const [sessions, setSessions] = useState<StudySession[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<StudySession | null>(null);
  const [formData, setFormData] = useState({
    subject: '',
    duration: '',
    pages: 0,
    lessons: 0,
    time: '',
    notes: ''
  });

  useEffect(() => {
    loadStudyData();
  }, [selectedDate]);

  const loadStudyData = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    const saved = localStorage.getItem(`study-${dateKey}`);
    if (saved) {
      setSessions(JSON.parse(saved));
    } else {
      setSessions([]);
    }
  };

  const saveStudyData = (updatedSessions: StudySession[]) => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    localStorage.setItem(`study-${dateKey}`, JSON.stringify(updatedSessions));
    setSessions(updatedSessions);
  };

  const handleSubmit = () => {
    if (!formData.subject || !formData.time) return;

    const session: StudySession = {
      id: editingSession ? editingSession.id : Date.now().toString(),
      ...formData
    };

    let updatedSessions;
    if (editingSession) {
      updatedSessions = sessions.map(s => s.id === editingSession.id ? session : s);
    } else {
      updatedSessions = [...sessions, session];
    }

    saveStudyData(updatedSessions);
    resetForm();
    setIsDialogOpen(false);
  };

  const deleteSession = (id: string) => {
    const updatedSessions = sessions.filter(s => s.id !== id);
    saveStudyData(updatedSessions);
  };

  const editSession = (session: StudySession) => {
    setEditingSession(session);
    setFormData({
      subject: session.subject,
      duration: session.duration,
      pages: session.pages,
      lessons: session.lessons,
      time: session.time,
      notes: session.notes || ''
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      subject: '',
      duration: '',
      pages: 0,
      lessons: 0,
      time: '',
      notes: ''
    });
    setEditingSession(null);
  };

  const getTotalStats = () => {
    return sessions.reduce((total, session) => ({
      totalPages: total.totalPages + session.pages,
      totalLessons: total.totalLessons + session.lessons,
      totalDuration: total.totalDuration + (session.duration ? parseInt(session.duration) || 0 : 0)
    }), { totalPages: 0, totalLessons: 0, totalDuration: 0 });
  };

  const stats = getTotalStats();

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-secondary to-primary rounded-lg">
            <GraduationCap className="w-6 h-6 text-secondary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">المواد الدراسية</h2>
            <p className="text-sm text-muted-foreground">تتبع تقدمك الأكاديمي</p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة جلسة دراسية
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingSession ? 'تعديل الجلسة الدراسية' : 'إضافة جلسة دراسية جديدة'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="subject">اسم المادة</Label>
                <Input
                  id="subject"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  placeholder="مثال: الرياضيات"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="time">وقت البداية</Label>
                  <Input
                    id="time"
                    type="time"
                    value={formData.time}
                    onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="duration">المدة (دقيقة)</Label>
                  <Input
                    id="duration"
                    type="number"
                    min="1"
                    value={formData.duration}
                    onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                    placeholder="60"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="pages">عدد الصفحات</Label>
                  <Input
                    id="pages"
                    type="number"
                    min="0"
                    value={formData.pages}
                    onChange={(e) => setFormData(prev => ({ ...prev, pages: parseInt(e.target.value) || 0 }))}
                  />
                </div>
                <div>
                  <Label htmlFor="lessons">عدد الدروس</Label>
                  <Input
                    id="lessons"
                    type="number"
                    min="0"
                    value={formData.lessons}
                    onChange={(e) => setFormData(prev => ({ ...prev, lessons: parseInt(e.target.value) || 0 }))}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="notes">ملاحظات أو روابط</Label>
                <Textarea
                  id="notes"
                  value={formData.notes}
                  onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="ملاحظات أو روابط مفيدة..."
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingSession ? 'تحديث الجلسة' : 'إضافة الجلسة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {sessions.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gradient-to-r from-secondary/10 to-primary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-secondary" />
              <div className="text-2xl font-bold text-secondary">{stats.totalDuration}</div>
            </div>
            <div className="text-sm text-muted-foreground">دقيقة دراسة</div>
          </div>
          <div className="bg-gradient-to-r from-primary/10 to-accent/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <BookOpen className="w-4 h-4 text-primary" />
              <div className="text-2xl font-bold text-primary">{stats.totalPages}</div>
            </div>
            <div className="text-sm text-muted-foreground">صفحة مقروءة</div>
          </div>
          <div className="bg-gradient-to-r from-accent/10 to-secondary/10 p-4 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <GraduationCap className="w-4 h-4 text-accent" />
              <div className="text-2xl font-bold text-accent">{stats.totalLessons}</div>
            </div>
            <div className="text-sm text-muted-foreground">درس مكتمل</div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {sessions.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            لا توجد جلسات دراسية مسجلة لهذا اليوم
          </div>
        ) : (
          sessions
            .sort((a, b) => a.time.localeCompare(b.time))
            .map((session) => (
              <div key={session.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-foreground">{session.subject}</h3>
                    <div className="flex items-center gap-1 text-muted-foreground text-sm">
                      <Clock className="w-3 h-3" />
                      {session.time}
                      {session.duration && ` (${session.duration} دقيقة)`}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {session.pages > 0 && `${session.pages} صفحة`}
                    {session.pages > 0 && session.lessons > 0 && ' • '}
                    {session.lessons > 0 && `${session.lessons} درس`}
                    {session.notes && (
                      <div className="mt-1 text-xs">{session.notes}</div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editSession(session)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteSession(session.id)}
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