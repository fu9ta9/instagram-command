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
import { Reply, ReplyInput, ReplyFormData, MATCH_TYPE } from '@/types/reply';
import { 
  Popover, 
  PopoverContent, 
  PopoverTrigger 
} from "@/components/ui/popover";
import { History, Pencil, Trash2, ChevronRight, Eye, ArrowLeft } from 'lucide-react';

// ストーリーモード用のスキーマ（投稿選択不要）
const storySchema = z.object({
  keyword: z.string().min(1, { message: "キーワードを入力してください" }),
  matchType: z.number().refine(val => val === MATCH_TYPE.EXACT || val === MATCH_TYPE.PARTIAL),
  reply: z.string().min(1, { message: "返信内容を入力してください" }),
  buttons: z.array(z.object({
    title: z.string(),
    url: z.string()
  })).optional()
});

// 投稿モード用のスキーマ（投稿選択必要）
const postSchema = z.object({
  postId: z.string().min(1, { message: "投稿を選択してください" }),
  keyword: z.string().min(1, { message: "キーワードを入力してください" }),
  matchType: z.number().refine(val => val === MATCH_TYPE.EXACT || val === MATCH_TYPE.PARTIAL),
  reply: z.string().min(1, { message: "返信内容を入力してください" }),
  buttons: z.array(z.object({
    title: z.string(),
    url: z.string()
  })).optional()
});

// FormDataインターフェースも修正
interface FormData {
  keyword: string;
  reply: string;
  matchType: MatchType;
  postId?: string;
  buttons?: Array<{
    title: string;
    url: string;
  }>;
}

interface KeywordRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ReplyInput | Omit<Reply, 'id'>) => Promise<any>;
  initialData?: ReplyFormData;
  isEditing?: boolean;
  isStoryMode?: boolean;
}

enum MatchType {
  EXACT = 0,
  PARTIAL = 1,
  REGEX = 2
}

const KeywordRegistrationModal: React.FC<KeywordRegistrationModalProps> = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  initialData, 
  isEditing = false, 
  isStoryMode = false 
}) => {
  // ストーリーモードの場合は投稿選択をスキップしてステップ2から開始
  const initialStep = isStoryMode ? 2 : 1;
  // ストーリーモードの場合は全体のステップ数を2にする
  const totalSteps = isStoryMode ? 2 : 3;
  
  const [step, setStep] = useState(initialStep);
  const [selectedPost, setSelectedPost] = useState<any>(null);
  const [isAddingButton, setIsAddingButton] = useState(false);
  const [buttonTitle, setButtonTitle] = useState('');
  const [buttonUrl, setButtonUrl] = useState('');
  const [buttons, setButtons] = useState<Array<{title: string, url: string}>>(initialData?.buttons || []);
  const [editingButtonIndex, setEditingButtonIndex] = useState<number | null>(null);
  
  // 過去の返信履歴
  const [recentReplies, setRecentReplies] = useState<Reply[]>([]);
  const [isReplyHistoryOpen, setIsReplyHistoryOpen] = useState(false);
  const [isButtonHistoryOpen, setIsButtonHistoryOpen] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  // SP判定（Tailwindのsm:と同じ640px）
  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 640 : false;

  // ストーリーモードに応じて適切なスキーマを選択
  const schema = isStoryMode ? storySchema : postSchema;

  const { control, handleSubmit, setValue, watch, reset, formState: { errors, isValid } } = useForm<FormData>({
    resolver: zodResolver(schema),
    mode: 'onChange',
    defaultValues: {
      keyword: initialData?.keyword || '',
      reply: initialData?.reply || '',
      matchType: initialData?.matchType || MATCH_TYPE.PARTIAL,
      postId: isStoryMode ? undefined : (initialData?.postId || ''),
      buttons: initialData?.buttons || []
    }
  });

  const replyContent = watch('reply');
  const keyword = watch('keyword');

  // 過去の返信を取得
  useEffect(() => {
    const fetchRecentReplies = async () => {
      try {
        setRecentReplies([]); // 初期化
        const response = await fetch('/api/replies/recent');
        
        if (!response.ok) {
          const errorData = await response.json();
          console.error('過去の返信の取得に失敗しました:', errorData);
          return;
        }
        
        const data = await response.json();
        console.log('取得した過去の返信:', data);
        setRecentReplies(data);
      } catch (error) {
        console.error('過去の返信の取得に失敗しました:', error);
      }
    };
    
    if (isOpen) {
      fetchRecentReplies();
    }
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        console.log("初期データ:", initialData); // デバッグ用
        
        // matchTypeが数値であることを確認
        const matchType = typeof initialData.matchType === 'number' 
          ? initialData.matchType 
          : MATCH_TYPE.PARTIAL;
        
        reset({
          keyword: initialData.keyword,
          reply: initialData.reply,
          matchType: matchType,
          postId: isStoryMode ? undefined : (initialData.postId || ''),
          buttons: initialData.buttons || []
        });
        
        if (!isStoryMode) {
          setSelectedPost({ 
            id: initialData.postId,
            thumbnail_url: null
          });
        }
        setButtons(initialData.buttons || []);
        setStep(initialStep);
      } else {
        reset({
          keyword: '',
          reply: '',
          matchType: MATCH_TYPE.PARTIAL,
          postId: isStoryMode ? undefined : '',
          buttons: []
        });
        setStep(initialStep);
        setSelectedPost(null);
        setButtons([]);
      }
      setEditingButtonIndex(null);
    }
  }, [isOpen, reset, initialData, isStoryMode, initialStep]);

  const handleSelectPost = (post: any) => {
    setSelectedPost(post);
    setValue('postId', post.id);
  };

  const handleNext = () => {
    if (isStoryMode) {
      // ストーリーモードの場合: 2 -> 3
      if (step === 2) setStep(3);
    } else {
      // 投稿モードの場合: 1 -> 2 -> 3
      if (step < 3) setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (isStoryMode) {
      // ストーリーモードの場合: 3 -> 2
      if (step === 3) setStep(2);
    } else {
      // 投稿モードの場合: 3 -> 2 -> 1 または 2 -> 1
      if (step > 1) setStep(step - 1);
    }
  };

  // 過去の返信選択時の処理を修正
  const handleSelectRecentReply = (recentReply: Reply) => {
    // フォームの値を更新
    setValue('reply', recentReply.reply, { 
      shouldValidate: true, // バリデーションを実行
      shouldDirty: true     // フォームを変更済み状態にする
    });
    
    // ポップオーバーを閉じる
    setIsReplyHistoryOpen(false);
  };

  // 過去のボタンを選択
  const handleSelectButton = (button: {title: string, url: string}) => {
    setButtonTitle(button.title);
    setButtonUrl(button.url);
    setIsButtonHistoryOpen(false);
  };

  // 過去のボタンセットを選択
  const handleSelectButtonSet = (buttons: Array<{title: string, url: string}>) => {
    setButtons(buttons);
    setIsButtonHistoryOpen(false);
  };

  // ボタンの編集を開始
  const handleEditButton = (index: number) => {
    const button = buttons[index];
    setButtonTitle(button.title);
    setButtonUrl(button.url);
    setEditingButtonIndex(index);
    setIsAddingButton(true);
  };

  // ボタンの更新
  const handleUpdateButton = () => {
    if (editingButtonIndex !== null && buttonTitle && buttonUrl) {
      const updatedButtons = [...buttons];
      updatedButtons[editingButtonIndex] = { title: buttonTitle, url: buttonUrl };
      setButtons(updatedButtons);
      setButtonTitle('');
      setButtonUrl('');
      setEditingButtonIndex(null);
      setIsAddingButton(false);
    }
  };

  // フォーム送信処理を修正
  const handleFormSubmit = (data: FormData) => {
    try {
      console.log("フォーム送信データ:", data);

      // ボタンデータの準備
      const buttonData = buttons.map((button, index) => ({
        title: button.title,
        url: button.url,
        order: index
      }));

      // 送信データの準備
      const replyData: ReplyInput = {
        keyword: data.keyword,
        reply: data.reply,
        matchType: data.matchType,
        replyType: 1, // SPECIFIC_POST
        postId: isStoryMode ? undefined : data.postId,
        buttons: buttonData
      };

      console.log("送信データ:", replyData);

      // 親コンポーネントのonSubmit関数を呼び出し
      try {
        onSubmit(replyData);
      } catch (error) {
        // エラーメッセージを表示
        if (error && typeof error === 'object' && 'status' in error && error.status === 409) {
          alert('同じキーワードと投稿IDの組み合わせが既に登録されています');
        } else {
          const errorMessage = error && typeof error === 'object' && 'message' in error 
            ? error.message 
            : '不明なエラー';
          alert('送信中にエラーが発生しました: ' + errorMessage);
        }
      }
    } catch (error) {
      console.error('Form submission error:', error);
      alert('送信中にエラーが発生しました: ' + (error instanceof Error ? error.message : String(error)));
    }
  };  

  const handleAddButton = () => {
    if (buttonTitle && buttonUrl) {
      if (editingButtonIndex !== null) {
        // 既存のボタンを更新
        handleUpdateButton();
      } else {
        // 新しいボタンを追加
        setButtons([...buttons, { title: buttonTitle, url: buttonUrl }]);
        setButtonTitle('');
        setButtonUrl('');
        setIsAddingButton(false);
      }
    }
  };

  // 改行をHTMLの改行タグに変換し、ボタンも表示する
  const renderPreview = (text: string) => {
    const formattedText = text.replace(/\n/g, '<br>');
    
    const buttonsHtml = buttons.map(button => `
      <div class="bg-white text-black border border-gray-300 p-3 rounded-lg mt-2 text-center cursor-pointer hover:bg-gray-100 transition-colors">
        ${button.title}
      </div>
    `).join('');
    
    return `
      <div class="whitespace-pre-wrap">${formattedText}</div>
      ${buttonsHtml}
    `;
  };

  // useEffectを追加して、initialDataが変更されたときにフォームを更新
  useEffect(() => {
    if (initialData) {
      setValue('keyword', initialData.keyword, { shouldValidate: true });
      setValue('reply', initialData.reply, { shouldValidate: true });
      setValue('matchType', initialData.matchType, { shouldValidate: true });
      if (!isStoryMode) {
        setValue('postId', initialData.postId || '', { shouldValidate: true });
      }
      
      // ボタンデータも設定
      if (initialData.buttons) {
        setButtons(initialData.buttons);
      }
    }
  }, [initialData, setValue, isStoryMode]);

  return (
    <Modal isOpen={isOpen} onClose={onClose}>
      <div className="p-6 max-w-4xl mx-auto">
        {/* タイトルはSP時非表示 */}
        <h1 className="text-2xl font-bold mb-6 hidden sm:block">{isEditing ? '返信を編集' : '新規返信登録'}</h1>
        <div className="mb-4 bg-gray-200 h-2 rounded-full">
          <div 
            className="bg-blue-500 h-full rounded-full transition-all duration-300 ease-in-out"
            style={{ 
              width: `${isStoryMode 
                ? (step === 2 ? 50 : 100)
                : (step / totalSteps) * 100
              }%` 
            }}
          />
        </div>
        <form onSubmit={handleSubmit(handleFormSubmit)}>
          {!isStoryMode && step === 1 && (
            <div>
              <h2 className="text-xl font-bold mb-4">投稿を選択</h2>
              <InstagramPostList 
                onSelectPost={handleSelectPost} 
                initialSelectedPostId={initialData?.postId}
                onNext={handleNext}
                // サムネイル画像の日付はInstagramPostList内でabsolute left-1 top-1 text-xs bg-white/80 rounded px-1 py-0.5で左上小さく表示すること
              />
            </div>
          )}
          {step === 2 && (
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
                      name="matchType"
                      control={control}
                      options={[
                        { value: MATCH_TYPE.EXACT, label: '完全一致' },
                        { value: MATCH_TYPE.PARTIAL, label: '部分一致' }
                      ]}
                      defaultValue={field.value || MATCH_TYPE.PARTIAL}
                    />
                  )}
                />
              </div>
              <div className="mt-4 flex justify-between">
                {!isStoryMode && (
                  <Button type="button" onClick={handleBack} variant="outline">戻る</Button>
                )}
                {isStoryMode && <div></div>}
                <Button type="button" onClick={handleNext} disabled={!keyword}>
                  次へ
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
          {step === 3 && (
            <div>
              <div className="text-xl font-bold mb-4">返信文を入力</div>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                {/* 入力欄（SP時はプレビュー非表示時のみ） */}
                {(!showPreview || !isMobile) && (
                  <div className="flex-1 flex flex-col">
                    <div className="font-semibold mb-2 flex justify-between items-center">
                      <span>返信内容</span>
                      <Popover open={isReplyHistoryOpen} onOpenChange={setIsReplyHistoryOpen}>
                        <PopoverTrigger asChild>
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                          >
                            <History className="h-4 w-4" />
                            <span>過去の返信</span>
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-80 p-0">
                          <div className="p-2 font-semibold border-b">過去の返信文</div>
                          <div className="max-h-60 overflow-y-auto">
                            {recentReplies.length > 0 ? (
                              recentReplies.map((reply) => (
                                <div 
                                  key={reply.id} 
                                  className="p-2 hover:bg-gray-100 cursor-pointer border-b text-sm"
                                  onClick={() => handleSelectRecentReply(reply)}
                                >
                                  <div className="line-clamp-2">{reply.reply}</div>
                                </div>
                              ))
                            ) : (
                              <div className="p-4 text-center text-gray-500">
                                過去の返信がありません
                              </div>
                            )}
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                    <Controller
                      name="reply"
                      control={control}
                      render={({ field }) => (
                        <Textarea 
                          {...field} 
                          placeholder="返信内容を入力してください" 
                          className="flex-grow min-h-[150px]" 
                        />
                      )}
                    />
                    {errors.reply && <p className="text-red-500 text-sm mt-1">{errors.reply.message}</p>}
                    {/* プレビュートグル（SPのみ） */}
                    {isMobile && (
                      <Button
                        type="button"
                        variant="outline"
                        className="mt-2 bg-blue-100 text-blue-700 hover:bg-blue-200 border-blue-200 flex items-center gap-1"
                        onClick={() => setShowPreview(true)}
                      >
                        <Eye className="h-4 w-4" />
                        プレビューを見る
                      </Button>
                    )}
                    
                    <div className="mt-4">
                      <div className="font-semibold mb-2 flex justify-between items-center">
                        <span>ボタン</span>
                        <Popover open={isButtonHistoryOpen} onOpenChange={setIsButtonHistoryOpen}>
                          <PopoverTrigger asChild>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="flex items-center gap-1"
                            >
                              <History className="h-4 w-4" />
                              <span>過去のボタン</span>
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-80 p-0">
                            <div className="p-2 font-semibold border-b">過去のボタン</div>
                            <div className="max-h-60 overflow-y-auto">
                              {recentReplies.filter(reply => reply.buttons && reply.buttons.length > 0).length > 0 ? (
                                recentReplies.filter(reply => reply.buttons && reply.buttons.length > 0).map((reply) => (
                                  <div 
                                    key={reply.id} 
                                    className="p-2 hover:bg-gray-100 cursor-pointer border-b"
                                  >
                                    <div className="font-medium text-sm mb-1">
                                      {reply.keyword}の返信
                                    </div>
                                    <div className="flex flex-wrap gap-1">
                                      {reply.buttons?.map((button, idx) => (
                                        <div 
                                          key={idx} 
                                          className="text-xs bg-gray-100 p-1 rounded"
                                          onClick={() => handleSelectButton({
                                            title: button.title,
                                            url: button.url
                                          })}
                                        >
                                          {button.title}
                                        </div>
                                      ))}
                                    </div>
                                    <Button 
                                      size="sm" 
                                      variant="outline" 
                                      className="mt-1 w-full text-xs"
                                      onClick={() => handleSelectButtonSet(
                                        reply.buttons?.map(b => ({
                                          title: b.title,
                                          url: b.url
                                        })) || []
                                      )}
                                    >
                                      このセットを使用
                                    </Button>
                                  </div>
                                ))
                              ) : (
                                <div className="p-4 text-center text-gray-500">
                                  過去のボタンがありません
                                </div>
                              )}
                            </div>
                          </PopoverContent>
                        </Popover>
                      </div>
                      
                      {buttons.map((button, index) => (
                        <div key={index} className="flex items-center mb-2">
                          <div className="flex-grow border p-2 rounded-lg text-sm">
                            {button.title} - {button.url}
                          </div>
                          <div className="flex ml-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8 mr-1"
                              onClick={() => handleEditButton(index)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="icon"
                              className="h-8 w-8"
                              onClick={() => setButtons(buttons.filter((_, i) => i !== index))}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                      
                      {isAddingButton ? (
                        <div className="mt-2">
                          <div className="flex mb-2">
                            <Input 
                              value={buttonTitle} 
                              onChange={(e) => setButtonTitle(e.target.value)} 
                              placeholder="ボタンのタイトル" 
                              className="mr-2"
                            />
                            <Input 
                              value={buttonUrl} 
                              onChange={(e) => setButtonUrl(e.target.value)} 
                              placeholder="URL" 
                            />
                          </div>
                          <div className="flex justify-end space-x-2">
                            <Button 
                              type="button" 
                              variant="outline" 
                              size="sm"
                              onClick={() => {
                                setButtonTitle('');
                                setButtonUrl('');
                                setEditingButtonIndex(null);
                                setIsAddingButton(false);
                              }}
                            >
                              キャンセル
                            </Button>
                            <Button 
                              type="button" 
                              size="sm"
                              onClick={handleAddButton}
                              disabled={!buttonTitle || !buttonUrl}
                            >
                              {editingButtonIndex !== null ? '更新' : '追加'}
                            </Button>
                          </div>
                        </div>
                      ) : (
                        <Button 
                          type="button" 
                          variant="outline" 
                          className="w-full"
                          onClick={() => setIsAddingButton(true)}
                        >
                          ボタンを追加
                        </Button>
                      )}
                    </div>
                  </div>
                )}
                {/* プレビュー（SP時はトグルで表示） */}
                {(showPreview || !isMobile) && (
                  <div className="flex-1 flex flex-col bg-gray-100 p-4 rounded-lg overflow-auto">
                    <div className="font-semibold mb-2 flex justify-between items-center">
                      <span>プレビュー</span>
                      {isMobile && (
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          className="flex items-center gap-1"
                          onClick={() => setShowPreview(false)}
                        >
                          <ArrowLeft className="h-4 w-4" />
                          入力に戻る
                        </Button>
                      )}
                    </div>
                    <div dangerouslySetInnerHTML={{ __html: renderPreview(replyContent || '') }} />
                  </div>
                )}
              </div>
              <div className="mt-4 flex justify-between">
                <Button type="button" onClick={handleBack} variant="outline">戻る</Button>
                <Button type="submit" disabled={!isValid}>
                  {isEditing ? '更新' : '登録'}
                </Button>
              </div>
            </div>
          )}
        </form>
      </div>
    </Modal>
  );
};

export default KeywordRegistrationModal;