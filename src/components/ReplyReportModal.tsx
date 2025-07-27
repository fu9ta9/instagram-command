import React, { useState, useEffect } from 'react';
import { Reply } from '@/types/reply';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart3, Send, Eye, TrendingUp, Loader2 } from 'lucide-react';

interface ReplyReportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  reply: Reply | null;
}

interface ReplyStatsData {
  sentCount: number;
  readCount: number;
  readRate: number;
  unreadCount: number;
  lastUpdated: string;
}

const ReplyReportModal: React.FC<ReplyReportModalProps> = ({
  open,
  onOpenChange,
  reply
}) => {
  const [statsData, setStatsData] = useState<ReplyStatsData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // モーダルが開かれたときにデータを取得
  useEffect(() => {
    if (open && reply) {
      fetchStatsData();
    }
  }, [open, reply]);

  const fetchStatsData = async () => {
    if (!reply) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/replies/${reply.id}/stats`);
      if (!response.ok) {
        throw new Error('統計データの取得に失敗しました');
      }
      const data = await response.json();
      setStatsData(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
      setError(error instanceof Error ? error.message : '統計データの取得に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!reply) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-gray-900">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-600" />
            返信レポート
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 p-1">
          {/* ローディング状態 */}
          {isLoading && (
            <div className="flex justify-center items-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
              <span className="ml-2 text-gray-600">統計データを読み込み中...</span>
            </div>
          )}

          {/* エラー状態 */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-md">
              <p className="text-red-600">{error}</p>
              <button 
                onClick={fetchStatsData}
                className="mt-2 text-sm text-red-700 underline"
              >
                再試行
              </button>
            </div>
          )}

          {/* データが読み込まれた場合のみ表示 */}
          {!isLoading && !error && statsData && (
            <>
          {/* 返信情報 */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">返信設定</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm text-gray-500">キーワード：</span>
                  <span className="ml-2 font-medium">{reply.keyword}</span>
                </div>
                <div>
                  <span className="text-sm text-gray-500">マッチングタイプ：</span>
                  <span className="ml-2 font-medium">
                    {reply.matchType === 1 ? '完全一致' : reply.matchType === 2 ? '部分一致' : '不明'}
                  </span>
                </div>
              </div>
              <div>
                <span className="text-sm text-gray-500">コメント内返信：</span>
                <span className="ml-2 font-medium">
                  {reply.commentReplyEnabled ? '有効' : '無効'}
                </span>
              </div>
              <div>
                <span className="text-sm text-gray-500">返信文：</span>
                <p className="ml-2 mt-1 p-3 bg-gray-50 dark:bg-gray-700 rounded-md text-sm">
                  {reply.reply}
                </p>
              </div>
              {reply.buttons && reply.buttons.length > 0 && (
                <div>
                  <span className="text-sm text-gray-500">ボタンURL：</span>
                  <div className="ml-2 mt-1 space-y-1">
                    {reply.buttons.map((button, index) => (
                      <div key={index} className="text-sm text-blue-600 bg-blue-50 dark:bg-blue-900/30 p-2 rounded">
                        {button.title}: {button.url}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* 統計サマリー */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Send className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-2xl font-bold text-blue-600">{statsData.sentCount}</p>
                    <p className="text-xs text-gray-500">送信数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-2xl font-bold text-green-600">{statsData.readCount}</p>
                    <p className="text-xs text-gray-500">既読数</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-600" />
                  <div>
                    <p className="text-2xl font-bold text-orange-600">{statsData.readRate}%</p>
                    <p className="text-xs text-gray-500">既読率</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 既読率の詳細 */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">既読率詳細</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>既読率</span>
                  <span className="font-medium">{statsData.readRate}%</span>
                </div>
                <Progress value={statsData.readRate} className="h-3" />
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">送信済み:</span>
                  <span className="font-medium">{statsData.sentCount}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">既読済み:</span>
                  <span className="font-medium">{statsData.readCount}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">未読:</span>
                  <span className="font-medium">{statsData.unreadCount}件</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">最終更新:</span>
                  <span className="font-medium">{formatDate(statsData.lastUpdated)}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* パフォーマンス分析 */}
          <Card className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
            <CardHeader>
              <CardTitle className="text-lg text-gray-900 dark:text-gray-100">パフォーマンス分析</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg">
                  <div>
                    <p className="font-medium text-green-800">
                      {statsData.readRate >= 50 ? '良好な既読率' : 
                       statsData.readRate >= 20 ? '平均的な既読率' : 
                       statsData.sentCount === 0 ? 'データ収集中' : '改善の余地あり'}
                    </p>
                    <p className="text-sm text-green-600">
                      {statsData.sentCount === 0 
                        ? 'まだメッセージが送信されていません'
                        : `${statsData.readRate}%の既読率です`
                      }
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-green-600" />
                </div>
                
                <div className="text-sm text-gray-600 space-y-1">
                  <p>📈 <strong>改善のヒント:</strong></p>
                  <ul className="list-disc list-inside ml-4 space-y-1">
                    <li>メッセージの送信タイミングを最適化する</li>
                    <li>より魅力的な返信文を検討する</li>
                    <li>ボタンの配置やテキストを見直す</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
          </>)}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ReplyReportModal;