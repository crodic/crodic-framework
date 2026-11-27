import { slugifyAscii } from './slug.util';

describe('slugifyAscii', () => {
  it('preserves the shared Vietnamese and punctuation normalization', () => {
    expect(slugifyAscii('  Đặng Thị Ánh_Ngọc!  ')).toBe('dang-thi-anh-ngoc');
  });

  it('applies the optional maximum length and trims a trailing hyphen', () => {
    expect(slugifyAscii(`${'a'.repeat(149)} b`, 150)).toBe('a'.repeat(149));
  });

  it('returns an empty slug when the input has no supported ASCII characters', () => {
    expect(slugifyAscii('東京')).toBe('');
  });
});
