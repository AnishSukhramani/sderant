-- Create storage bucket for post images
INSERT INTO storage.buckets (id, name, public) VALUES ('post-images', 'post-images', true);

-- Create policy to allow public access to images
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'post-images');

-- Create policy to allow anonymous uploads
CREATE POLICY "Allow anonymous uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'post-images');

-- Create policy to allow anonymous updates
CREATE POLICY "Allow anonymous updates" ON storage.objects FOR UPDATE USING (bucket_id = 'post-images');

-- Create policy to allow anonymous deletes
CREATE POLICY "Allow anonymous deletes" ON storage.objects FOR DELETE USING (bucket_id = 'post-images');