'use client';

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Box, LayoutTemplate } from 'lucide-react';
import { CMS_COMPONENTS } from '@/lib/cms-registry';
import { CMS_TEMPLATES } from '@/lib/cms-templates';

interface ComponentPickerModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  handleAddBlock: (type: string) => void;
  handleAddTemplate: (templateKey: string) => void;
}

export default function ComponentPickerModal({
  isOpen, onOpenChange, handleAddBlock, handleAddTemplate
}: ComponentPickerModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white shadow-2xl">
        <DialogHeader>
          <DialogTitle className="text-center text-sm font-bold uppercase tracking-widest text-gray-900">
            Tambahkan Elemen
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="elements" className="w-full mt-2">
          <TabsList className="grid w-full grid-cols-2 mb-6 bg-gray-100/80">
            <TabsTrigger value="elements" className="text-xs uppercase font-bold tracking-widest">
              <Box className="w-3.5 h-3.5 mr-2" /> Atomic Elements
            </TabsTrigger>
            <TabsTrigger value="templates" className="text-xs uppercase font-bold tracking-widest">
              <LayoutTemplate className="w-3.5 h-3.5 mr-2" /> Pre-built Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value="elements" className="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(CMS_COMPONENTS).map(([key, blueprint]) => (
                <button key={key} onClick={() => handleAddBlock(key)} className="group flex flex-col items-center p-4 border border-gray-200 rounded-xl hover:border-blue-500 hover:shadow-md transition-all text-center bg-gray-50 hover:bg-white">
                  <div className="w-10 h-10 bg-white border border-gray-200 rounded-lg flex items-center justify-center mb-3 group-hover:bg-blue-50 group-hover:border-blue-200 transition-colors">
                    <Box className="w-5 h-5 text-gray-400 group-hover:text-blue-600" />
                  </div>
                  <span className="font-bold text-[10px] uppercase tracking-widest mb-1 text-gray-900">{blueprint.name}</span>
                  <span className="text-[9px] text-gray-500 line-clamp-2">{blueprint.description}</span>
                </button>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="templates" className="max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(CMS_TEMPLATES).map(([key, tmpl]) => {
                const Icon = tmpl.icon || LayoutTemplate;
                return (
                  <button key={key} onClick={() => handleAddTemplate(key)} className="group flex flex-col items-start p-4 border border-gray-200 rounded-xl hover:border-indigo-500 hover:shadow-md transition-all text-left bg-indigo-50/30 hover:bg-white">
                    <div className="w-10 h-10 bg-white border border-indigo-100 rounded-lg flex items-center justify-center mb-3 shadow-sm group-hover:bg-indigo-50 group-hover:border-indigo-200 transition-colors">
                      <Icon className="w-5 h-5 text-indigo-400 group-hover:text-indigo-600" />
                    </div>
                    <span className="font-bold text-[10px] uppercase tracking-widest mb-1 text-gray-900">{tmpl.name}</span>
                    <span className="text-[9px] text-gray-500 line-clamp-2">{tmpl.description}</span>
                  </button>
                );
              })}
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}