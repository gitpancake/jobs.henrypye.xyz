'use client';

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';

interface CVModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CVModal({ isOpen, onClose }: CVModalProps) {
  const [cvContent, setCvContent] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadCV();
    }
  }, [isOpen]);

  const loadCV = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/cv');
      if (response.ok) {
        const data = await response.json();
        setCvContent(data.content || '');
      }
    } catch (error) {
      setError('Failed to load CV');
    } finally {
      setIsLoading(false);
    }
  };

  const saveCV = async () => {
    setIsSaving(true);
    setError(null);
    setSuccess(false);
    try {
      const response = await fetch('/api/cv', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: cvContent }),
      });

      if (response.ok) {
        setSuccess(true);
        setTimeout(() => setSuccess(false), 3000);
      } else {
        throw new Error('Failed to save CV');
      }
    } catch (error) {
      setError('Failed to save CV');
    } finally {
      setIsSaving(false);
    }
  };

  const handleClose = () => {
    setCvContent('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Your CV</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Your CV will be used for AI suitability analysis when analyzing job descriptions.
            This helps determine how well you match each role.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}

          {success && (
            <div className="bg-green-50 border border-green-200 rounded-md p-3">
              <p className="text-green-600 text-sm">CV saved successfully!</p>
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="cvContent">CV Content</Label>
            <Textarea
              id="cvContent"
              value={cvContent}
              onChange={(e) => setCvContent(e.target.value)}
              rows={20}
              disabled={isLoading}
              className="font-mono text-sm"
              placeholder="Paste your CV content here..."
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button onClick={saveCV} disabled={isSaving || isLoading}>
              {isSaving ? 'Saving...' : 'Save CV'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}