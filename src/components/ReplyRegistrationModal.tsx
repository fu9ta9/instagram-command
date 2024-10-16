import React, { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup } from "@/components/ui/RadioGroup";
import Modal from './Modal';
import InstagramPostList from './InstagramPostList';
import { Reply, ReplyInput, ReplyFormData } from '@/types/reply';

// Zodスキーマの定義
const schema = z.object({
  instagramPostId: z.string().min(1, { message: "投稿を選択してください" }),
  keyword: z.string().min(1, { message: "キーワードを入力してください" }),
  matchType: z.enum(['partial', 'exact']),
  reply: z.string().min(1, { message: "返信内容を入力してください" }),
  buttons: z.array(z.object({
    title: z.string(),
    url: z.string()
  })).optional()
});

type FormData = z.infer<typeof schema>;

interface KeywordRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: Omit<Reply, 'id'>) => void;
  initialData?: Omit<Reply, 'id'>;
  isEditing?: boolean;
}

const KeywordRegistrationModal: React.FC<KeywordRegistrationModalProps> = ({ isOpen, onClose, onSubmit, initialData, isEditing = false }) => {
  const [step, setStep] = useState(isEditing ? 3 : 1);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isAddingButton, setIsAddingButton] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttons, setButtons] = useState<Array<{title: string, url: string}>>(initialData?.buttons || []);

  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: initialData || {
      matchType: 'partial',
      buttons: []
    }
  });

  const replyContent = watch('reply');
  const keyword = watch('keyword');

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        reset(initialData);
        setSelectedPost({ id: initialData.instagramPostId, thumbnail_url: initialData.postImage });
        setButtons(initialData.buttons);
        setStep(3); // 編集モードの場合、最後のステップから始める
      } else {
        reset();
        setStep(1);
        setSelectedPost(null);
        setButtons([]);
      }
    }
  }, [isOpen, reset, initialData]);

  const handleSelectPost = (post: any) => {
    setSelectedPost(post);
    setValue('instagramPostId', post.id);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleFormSubmit = (data: FormData) => {
    onSubmit({ ...data, postImage: selectedPost.thumbnail_url, buttons });
    onClose();
  };

  const handleAddButton = () => {
    if (buttonTitle && buttonUrl) {
      setButtons([...buttons, { title: buttonTitle, url: buttonUrl }]);
      setButtonTitle('');
      setButtonUrl('');
      setIsAddingButton(false);
    }
  };

  const renderPreview = (content: string) => {
    return `
      <div class="whitespace-pre-wrap">${content}</div>
      ${buttons.map(button => `
        <div class="bg-white text-black border border-gray-300 p-3 rounded-lg mt-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
          ${button.title}
        </div>
      `).join('')}
    `;
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-4">
        {!isEditing && (
          <div className="mb-4 bg-gray-200 h-2 rounded-full">
            <div 
              className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-in-out"
              style={{ width: `${(step / 3) * 100}%` }}
            />
          </div>
        )}
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {!isEditing && step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">投稿を選択</h2>
              <InstagramPostList onSelectPost={handleSelectPost} />
              <div className="mt-4 flex justify-end">
                <Button type="button" onClick={handleNext} disabled={!selectedPost}>次へ</Button>
              </div>
            </div>
          )}
          {!isEditing && step === 2 && (
            <div>
              <h2 className="text-xl font-bold mb-4">キーワードを登録</h2>
              <Controller
                name="keyword"
                control={control}
                render={({ field }) => <Input {...field} placeholder="キーワード" />}
              />
              {errors.keyword && <p className="text-red-500 text-sm mt-1">{errors.keyword.message}</p>}
              <div className="mt-4">
                <p className="mb-2">マッチング方法:</p>
                <Controller
                  name="matchType"
                  control={control}
                  render={({ field }) => (
                    <RadioGroup
                      options={[
                        { value: 'partial', label: '一部含まれる' },
                        { value: 'exact', label: '完全に一致' },
                      ]}
                      value={field.value}
                      onChange={field.onChange}
                      name={field.name}
                    />
                  )}
                />
              </div>
              <div className="mt-4 flex justify-between">
                <Button type="button" onClick={handleBack}>戻る</Button>
                <Button type="button" onClick={handleNext} disabled={!keyword}>次へ</Button>
              </div>
            </div>
          )}
        {(isEditing || step === 3) && (
            <div>
              <div className="text-xl font-bold mb-4">返信文を入力</div>
              <div className="flex space-x-4">
                <div className="w-1/2 flex flex-col">
                  <div className="font-semibold mb-2">返信内容</div>
                  <Controller
                    name="reply"
                    control={control}
                    render={({ field }) => (
                      <div className="flex-grow relative border rounded-md overflow-hidden">
                        <Textarea 
                          {...field} 
                          placeholder="返信内容を入力してください" 
                          className="h-full min-h-[10rem] pb-10 border-none resize-none" 
                        />
                        <div 
                          className="absolute bottom-0 left-0 right-0 p-2 border-t border-dashed border-gray-200 bg-gray-50"
                        >
                          <Button 
                            type="button" 
                            onClick={() => setIsAddingButton(true)}
                            className="w-full text-gray-400 hover:text-gray-600 bg-transparent hover:bg-gray-100"
                          >
                            + Add Button
                          </Button>
                        </div>
                      </div>
                    )}
                  />
                  {errors.reply && <p className="text-red-500 text-sm mt-1">{errors.reply.message}</p>}
                  {isAddingButton && (
                    <div className="mt-2 space-y-2">
                      <Input
                        placeholder="ボタンのタイトル"
                        value={buttonTitle}
                        onChange={(e) => setButtonTitle(e.target.value)}
                      />
                      <Input
                        placeholder="ボタンのURL"
                        value={buttonUrl}
                        onChange={(e) => setButtonUrl(e.target.value)}
                      />
                      <div className="flex space-x-2">
                        <Button type="button" onClick={handleAddButton} disabled={!buttonTitle || !buttonUrl}>
                          追加
                        </Button>
                        <Button type="button" onClick={() => setIsAddingButton(false)} variant="outline">
                          キャンセル
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
                <div className="w-1/2 flex flex-col">
                  <div className="font-semibold mb-2">プレビュー</div>
                  <div className="flex-grow bg-gray-100 p-4 rounded-lg overflow-auto">
                    <div dangerouslySetInnerHTML={{ __html: renderPreview(replyContent || '') }} />
                  </div>
                </div>
              </div>
              <div className="mt-4 flex justify-between">
                {!isEditing && <Button type="button" onClick={handleBack}>戻る</Button>}
                <Button type="submit" disabled={!isValid}>{isEditing ? '更新' : '登録'}</Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default KeywordRegistrationModal;