import { lessonImage } from './lessonImages';

describe('lessonImage', () => {
  it('los 24 temas (6 niveles × 4) tienen su infografía', () => {
    const topicIds = [1, 2, 3, 4, 5, 6].flatMap((level) =>
      [1, 2, 3, 4].map((order) => level * 100 + order),
    );

    expect(topicIds.filter((id) => lessonImage(id) === null)).toEqual([]);
  });

  it('un tema sin imagen devuelve null', () => {
    expect(lessonImage(999)).toBeNull();
  });
});
