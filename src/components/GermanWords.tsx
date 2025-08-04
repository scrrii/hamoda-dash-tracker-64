import { useState, useEffect } from 'react';
import { Plus, Book, Edit, Trash2, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface GermanWord {
  id: string;
  german: string;
  arabic: string;
  example: string;
  date: string;
}

interface GermanWordsProps {
  selectedDate: Date;
}

export const GermanWords = ({ selectedDate }: GermanWordsProps) => {
  const [words, setWords] = useState<GermanWord[]>([]);
  const [allWords, setAllWords] = useState<GermanWord[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<GermanWord | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [formData, setFormData] = useState({
    german: '',
    arabic: '',
    example: ''
  });

  useEffect(() => {
    loadWordsData();
  }, [selectedDate]);

  useEffect(() => {
    filterWords();
  }, [searchTerm, allWords]);

  const loadWordsData = () => {
    // Load all words
    const allSaved = localStorage.getItem('german-words-all') || '[]';
    const allWordsData = JSON.parse(allSaved);
    setAllWords(allWordsData);

    // Load today's words
    const dateKey = selectedDate.toISOString().split('T')[0];
    const todayWords = allWordsData.filter((word: GermanWord) => word.date === dateKey);
    setWords(todayWords);
  };

  const saveWordsData = (newWord: GermanWord) => {
    const allSaved = localStorage.getItem('german-words-all') || '[]';
    let allWordsData = JSON.parse(allSaved);

    if (editingWord) {
      allWordsData = allWordsData.map((w: GermanWord) => w.id === editingWord.id ? newWord : w);
    } else {
      allWordsData.push(newWord);
    }

    localStorage.setItem('german-words-all', JSON.stringify(allWordsData));
    setAllWords(allWordsData);
    
    // Update today's words
    const dateKey = selectedDate.toISOString().split('T')[0];
    const todayWords = allWordsData.filter((word: GermanWord) => word.date === dateKey);
    setWords(todayWords);
  };

  const handleSubmit = () => {
    if (!formData.german || !formData.arabic) return;

    const word: GermanWord = {
      id: editingWord ? editingWord.id : Date.now().toString(),
      german: formData.german,
      arabic: formData.arabic,
      example: formData.example,
      date: selectedDate.toISOString().split('T')[0]
    };

    saveWordsData(word);
    resetForm();
    setIsDialogOpen(false);
  };

  const deleteWord = (id: string) => {
    const allSaved = localStorage.getItem('german-words-all') || '[]';
    const allWordsData = JSON.parse(allSaved);
    const updatedWords = allWordsData.filter((w: GermanWord) => w.id !== id);
    
    localStorage.setItem('german-words-all', JSON.stringify(updatedWords));
    setAllWords(updatedWords);
    
    // Update today's words
    const dateKey = selectedDate.toISOString().split('T')[0];
    const todayWords = updatedWords.filter((word: GermanWord) => word.date === dateKey);
    setWords(todayWords);
  };

  const editWord = (word: GermanWord) => {
    setEditingWord(word);
    setFormData({
      german: word.german,
      arabic: word.arabic,
      example: word.example
    });
    setIsDialogOpen(true);
  };

  const resetForm = () => {
    setFormData({
      german: '',
      arabic: '',
      example: ''
    });
    setEditingWord(null);
  };

  const filterWords = () => {
    if (!searchTerm) {
      const dateKey = selectedDate.toISOString().split('T')[0];
      const todayWords = allWords.filter((word: GermanWord) => word.date === dateKey);
      setWords(todayWords);
    } else {
      const filtered = allWords.filter((word: GermanWord) => 
        word.german.toLowerCase().includes(searchTerm.toLowerCase()) ||
        word.arabic.includes(searchTerm) ||
        word.example.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setWords(filtered);
    }
  };

  const getTodayWordsCount = () => {
    const dateKey = selectedDate.toISOString().split('T')[0];
    return allWords.filter((word: GermanWord) => word.date === dateKey).length;
  };

  return (
    <div className="bg-card rounded-xl p-6 shadow-soft border border-border">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-primary to-secondary rounded-lg">
            <Book className="w-6 h-6 text-primary-foreground" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-foreground">الكلمات الألمانية</h2>
            <p className="text-sm text-muted-foreground">
              {searchTerm ? 'نتائج البحث' : `${getTodayWordsCount()} كلمة جديدة اليوم`}
            </p>
          </div>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="gap-2">
              <Plus className="w-4 h-4" />
              إضافة كلمة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {editingWord ? 'تعديل الكلمة' : 'إضافة كلمة جديدة'}
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label htmlFor="german">الكلمة الألمانية</Label>
                <Input
                  id="german"
                  value={formData.german}
                  onChange={(e) => setFormData(prev => ({ ...prev, german: e.target.value }))}
                  placeholder="مثال: Hallo"
                  className="ltr text-left"
                />
              </div>

              <div>
                <Label htmlFor="arabic">الترجمة العربية</Label>
                <Input
                  id="arabic"
                  value={formData.arabic}
                  onChange={(e) => setFormData(prev => ({ ...prev, arabic: e.target.value }))}
                  placeholder="مثال: مرحبا"
                />
              </div>

              <div>
                <Label htmlFor="example">مثال أو جملة</Label>
                <Textarea
                  id="example"
                  value={formData.example}
                  onChange={(e) => setFormData(prev => ({ ...prev, example: e.target.value }))}
                  placeholder="مثال: Hallo, wie geht es dir?"
                  className="ltr text-left"
                />
              </div>

              <Button onClick={handleSubmit} className="w-full">
                {editingWord ? 'تحديث الكلمة' : 'إضافة الكلمة'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="mb-4">
        <div className="relative">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
          <Input
            placeholder="ابحث في الكلمات..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
      </div>

      <div className="space-y-3">
        {words.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            {searchTerm ? 'لا توجد نتائج للبحث' : 'لا توجد كلمات مسجلة لهذا اليوم'}
          </div>
        ) : (
          words
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .map((word) => (
              <div key={word.id} className="flex items-start justify-between p-4 bg-muted/30 rounded-lg">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-primary ltr text-left">{word.german}</h3>
                    <span className="text-foreground font-semibold">{word.arabic}</span>
                  </div>
                  {word.example && (
                    <p className="text-sm text-muted-foreground ltr text-left mb-2">
                      {word.example}
                    </p>
                  )}
                  <div className="text-xs text-muted-foreground">
                    تم إضافتها في: {new Date(word.date).toLocaleDateString('ar-SA')}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => editWord(word)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteWord(word.id)}
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))
        )}
      </div>

      {allWords.length > 0 && (
        <div className="mt-6 p-4 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-lg">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">إجمالي الكلمات المحفوظة</span>
            <span className="text-lg font-bold text-primary">{allWords.length} كلمة</span>
          </div>
        </div>
      )}
    </div>
  );
};