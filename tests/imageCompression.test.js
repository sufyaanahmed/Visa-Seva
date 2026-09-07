import assert from 'node:assert/strict';
import { describe, test } from 'node:test';
import { compressImage } from '../src/domain/imageCompression.js';

describe('imageCompression domain utility', () => {
  test('gracefully passes through file in non-browser Node environments', async () => {
    const fakeFile = {
      name: 'photo.jpg',
      size: 4500000,
      type: 'image/jpeg',
    };

    const result = await compressImage(fakeFile, { maxBytes: 1048576, square: true });
    assert.equal(result.file, fakeFile);
    assert.equal(result.originalSize, 4500000);
    assert.equal(result.compressedSize, 4500000);
    assert.equal(result.wasCompressed, false);
  });

  test('gracefully passes through non-image documents (e.g. PDF)', async () => {
    const fakePdf = {
      name: 'passport.pdf',
      size: 250000,
      type: 'application/pdf',
    };

    const result = await compressImage(fakePdf, { maxBytes: 307200 });
    assert.equal(result.file, fakePdf);
    assert.equal(result.wasCompressed, false);
  });
});
