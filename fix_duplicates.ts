import { fetchAllArticlesFromStore, fetchPipelineFromStore, deleteArticleFromStore, deletePipelineItemFromStore } from './src/lib/supabase.js';

async function run() {
  const articles = await fetchAllArticlesFromStore();
  const pipeline = await fetchPipelineFromStore();

  const toDeletePipeline = pipeline.filter(p => p.id.startsWith('pipe-17'));
  for (const p of toDeletePipeline) {
    await deletePipelineItemFromStore(p.id);
    console.log('Deleted pipeline item:', p.sourceTitle);
  }

  const toDeleteArticles = articles.filter(a => a.id.startsWith('scheme-auto-17'));
  for (const a of toDeleteArticles) {
    await deleteArticleFromStore(a.id);
    console.log('Deleted article:', a.title);
  }
}
run();
