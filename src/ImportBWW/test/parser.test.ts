import { readFile } from 'fs/promises';
import { parse } from '../Parser';
import { Score } from '../model';

describe('correctly parses score body', () => {
  test('it works without any headers', () => {
    expect(parse(`& sharpf sharpc 3_4`)).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '3',
              bottom: '4',
            },
          },
          bars: [],
        },
      ],
    });
  });

  test('it can parse common time signature', () => {
    expect(parse(`& sharpf sharpc C`)).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { type: 'common' },
          },
          bars: [],
        },
      ],
    });
  });

  test('it can parse cut time signature', () => {
    expect(parse(`& sharpf sharpc C_`)).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { type: 'cut' },
          },
          bars: [],
        },
      ],
    });
  });

  test('it can parse a single bar', () => {
    expect(
      parse(`
            & sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 !I
            `)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '4',
              bottom: '4',
            },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'B',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'C',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse a multiple bars', () => {
    expect(
      parse(`
            & sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 ! LA_4 B_4 C_4 D_4 !I
            `)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '4',
              bottom: '4',
            },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'B',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'C',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'B',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'C',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse a multiple lines', () => {
    expect(
      parse(`
            & sharpf sharpc 4_4 I! LA_4 !I
            & sharpf sharpc  I! LA_4 !I
            `)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '4',
              bottom: '4',
            },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {},
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse left and right beam directions', () => {
    expect(
      parse(`
            & sharpf sharpc 4_4 I! LAr_8 Bl_8 Cr_8 Dl_8 Er_8 Fl_8 HGr_8 HAl_8 !I
            `)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '4',
              bottom: '4',
            },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'B',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'C',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'E',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'F',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'HG',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'HA',
                    length: '8',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse gracenotes', () => {
    expect(
      parse(`
            & sharpf sharpc 4_4 I! LA_4 strlg LA_4 gstb B_4 tstc C_4 hstd D_4 lhstd D_4 ltstd D_4 lgstd D_4 !I
            `)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '4',
              bottom: '4',
            },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'strike',
                      value: {
                        note: 'lg',
                      },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'B',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'g-gracenote-strike',
                      value: { note: 'b' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'C',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'thumb-strike',
                      value: { note: 'c' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'heavy-half-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'heavy-thumb-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'heavy-g-gracenote-strike',
                      value: { note: 'd' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse doublings', () => {
    expect(
      parse(`
            & sharpf sharpc 4_4 I! dbla LA_4 hdbb B_4 tdbc C_4 dbd D_4 !I
            `)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '4',
              bottom: '4',
            },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'doubling',
                      value: { note: 'la' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'B',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-doubling',
                      value: { note: 'b' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'C',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'thumb-doubling',
                      value: { note: 'c' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'doubling',
                      value: { note: 'd' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse strikes', () => {
    expect(
      parse(`
            & sharpf sharpc 4_4 I! dbla LA_4 hdbb B_4 tdbc C_4 dbd D_4 !I
            `)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: {
              top: '4',
              bottom: '4',
            },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    pitch: 'LA',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'doubling',
                      value: { note: 'la' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'B',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-doubling',
                      value: { note: 'b' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'C',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'thumb-doubling',
                      value: { note: 'c' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    pitch: 'D',
                    length: '4',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'doubling',
                      value: { note: 'd' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse grips', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! LA_4 grp E_4 LG_4 hgrp E_4 D_4 grpb E_4 D_4 grpb LA_4 E_4 ggrpb B_4 D_4 ggrpdb E_4 tgrpd D_4 tgrpdb D_4 hgrpdb D_4 hgrpb B_4 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'grip' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LG',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'half-grip' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'b-grip' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'b-grip' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'g-gracenote-grip',
                      value: { note: 'b' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'g-gracenote-b-grip',
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'thumb-grip',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'thumb-b-grip' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'half-b-grip' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-grip',
                      value: { note: 'b' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse taorluaths', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! C_4 tar LA_4 D_4 tarb LA_4 !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'taorluath' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'b-taorluath' },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse bubbly notes', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! C_4 bubly B_4 LG_4 hbubly B_4 !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'bubbly-note' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LG',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-bubbly-note',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse birls', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! LA_4 brl LA_4 HA_4 abr LA_4 E_4 gbr LA_4 HG_4 tbr LA_4 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'birl' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'HA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'a-birl' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'g-gracenote-birl',
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'HG',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'thumb-birl' },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse throws', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! LA_4 thrd D_4 LA_4 hvthrd D_4 LG_4 hthrd D_4 LG_4 hhvthrd D_4 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'throw' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'heavy-throw' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LG',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: { type: 'half-throw' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LG',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-heavy-throw',
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse peles', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! E_4 pella LA_4 lpeld D_4 tpeld D_4 ltpeld D_4 hpeld D_4 lhpeld D_4 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'pele',
                      value: { note: 'la' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-pele',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'thumb-pele',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-thumb-pele',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-pele',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-half-pele',
                      value: { note: 'd' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse double strikes', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! LA_4 st2la LA_4 lst2d D_4 gst2d D_4 lgst2d D_4 tst2d D_4 ltst2d D_4 hst2d D_4 lhst2d D_4 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'double-strike',
                      value: { note: 'la' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-double-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'g-gracenote-double-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-g-gracenote-double-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'thumb-double-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-thumb-double-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-double-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-half-double-strike',
                      value: { note: 'd' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse triple strikes', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! LA_4 st3la LA_4 lst3d D_4 gst3d D_4 lgst3d D_4 tst3d D_4 ltst3d D_4 hst3d D_4 lhst3d D_4 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'triple-strike',
                      value: { note: 'la' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-triple-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'g-gracenote-triple-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-g-gracenote-triple-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'thumb-triple-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-thumb-triple-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'half-triple-strike',
                      value: { note: 'd' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'closed-half-triple-strike',
                      value: { note: 'd' },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse double gracenotes', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! dlg LA_4 gla B_4 tb C_4 thg HA_4 !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenotes',
                      value: { notes: ['d', 'lg'] },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenotes',
                      value: { notes: ['g', 'la'] },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenotes',
                      value: { notes: ['a', 'b'] },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'HA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenotes',
                      value: { notes: ['a', 'hg'] },
                    },
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse singly dotted notes', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! gg LA_4 tar LAr_8 'la Bl_16 !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenote',
                      value: { note: 'g' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'single',
                    embellishment: { type: 'taorluath' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '16',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse doubly dotted notes', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! gg LA_4 tar LAr_8 ''la Bl_16 !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenote',
                      value: { note: 'g' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'double',
                    embellishment: { type: 'taorluath' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '16',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse an anacrusis', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 E_8 ! gg LA_4 tar LAr_8 'la Bl_16 dbc Cr_8 eg LAl_8 dbc Cr_8 El_8 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,

          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenote',
                      value: { note: 'g' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'single',
                    embellishment: { type: 'taorluath' },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '16',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'doubling',
                      value: { note: 'c' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenote',
                      value: { note: 'e' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'doubling',
                      value: { note: 'c' },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '8',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse a repeated part', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I!'' LA_4 B_4 C_4 D_4 ''!I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: true,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse a rest', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! LA_4 B_4 REST_4 D_4 !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'rest',
                  value: {
                    length: '4',
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse accidentals before notes', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! LA_4 sharpb B_4 flatc C_4 naturald D_4 !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'sharp',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'flat',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'natural',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse fermatas', () => {
    expect(
      parse(`& sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 fermatd !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: true,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse the old tie format', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! LA_4 ^tla LA_4 B_4 C_4 ^tc ! C_4 D_2 ^td D_4 !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '2',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse the new tie format', () => {
    expect(
      parse(
        `& sharpf sharpc 4_4 I! ^ts LA_4 LA_4 ^te B_4 ^ts C_4 ! C_4 ^te ^ts D_2 D_4 ^te !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '4', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '2',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test("ties can begin before a note's embellishment", () => {
    const tune = `& sharpf sharpc 4_4 gg Br_8 LAl_8 dblg LG_4 'lg gg LG_8 ^ts dbhg HG_4
                        ! HGr_8 ^te Fl_8 	eg Fr_8 ^ts El_8 E_2
                        ! Er_8 ^te gg El_8 thrd D_4 'd dbb B_8 ag B_4
                        ! dblg LG_4 gg LA_2 'la
                        !I`;
    const ast: Score = parse(tune);

    expect(ast).toBeTruthy();
  });

  test('it can parse the new triplet format', () => {
    expect(
      parse(`& sharpf sharpc 2_4 I! gg ^3s C_8 E_8 LA_8 ^3e !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '2', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'triplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {
                            type: 'gracenote',
                            value: {
                              note: 'g',
                            },
                          },
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse the old triplet format', () => {
    expect(
      parse(`& sharpf sharpc 2_4 I! LA_4 E_8 C_8 LA_8 ^3e !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '2', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'triplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse an irregular note group', () => {
    expect(
      parse(`  & sharpf sharpc 6_8
                            I!
                            ^2s E_8 C_8 ^2e
                            ^43s LA_8 B_8 C_8 D_8 ^43e
                            ^46s LA_8 B_8 C_8 D_8 ^46e
                            ^53s LA_8 B_8 C_8 D_8 E_8 ^53e
                            ^54s LA_8 B_8 C_8 D_8 E_8 ^54e
                            !
                            ^64s LA_8 B_8 C_8 D_8 E_8 F_8 ^64e
                            ^74s LA_8 B_8 C_8 D_8 E_8 F_8 HG_8 ^74e
                            ^74s LA_8 B_8 C_8 D_8 E_8 F_8 HG_8 ^74e
                            !I`)
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '6', bottom: '8' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'duplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'quadruplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'B',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'D',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'quadruplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'B',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'D',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'quintuplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'B',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'D',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'quintuplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'B',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'D',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'sextuplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'B',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'D',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'F',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'septuplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'B',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'D',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'F',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'HG',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
                {
                  type: 'septuplet',
                  value: {
                    notes: [
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'LA',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'B',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'C',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'D',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'E',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'F',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                      {
                        type: 'note',
                        value: {
                          length: '8',
                          pitch: 'HG',
                          accidental: 'none',
                          tied: false,
                          fermata: false,
                          dot: 'none',
                          embellishment: {},
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse time lines', () => {
    expect(
      parse(
        `& sharpf sharpc 2_4 I! LA_4 B_4 ! '1 C_4 B_4 _' ! '2 C_4 D_4 _' ! 'intro HA_4 E_4 _' !I`
      )
    ).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: false,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '2', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'LA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'C',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'D',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'HA',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '4',
                    pitch: 'E',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse scotland the brave', async function () {
    const path = 'test/fixtures/Scotland_the_Brave.bww';
    const file = await readFile(path, {
      encoding: 'utf-8',
    });
    const ast: Score = parse(file);

    expect(ast).toBeTruthy();
  });

  test('it can skip unknown tokens', async function () {
    const path = 'test/fixtures/skip_unknown_tokens.bww';
    const file = await readFile(path, {
      encoding: 'utf-8',
    });
    const ast: Score = parse(file);

    expect(ast).toBeTruthy();
  });

  test('a tune can have a gracenote before a tied note', async function () {
    const tune = `& sharpf sharpc 4_4 I!'' gg LGr_16 LAl_16 Br_16 gg ^ts Dl_16		Dr_16 ^te Bl_16 gg Er_16 Dl_16 ''!I`;
    const ast: Score = parse(tune);

    expect(ast).toBeTruthy();
  });

  test('there can be multiple time lines on the same line', async function () {
    const tune = `& sharpf sharpc 9_8
                        Fr_16 gg Dl_8 'd HAl_8 			hdbf F_4 'f 					thrd D_4 C_8 
                    !	gg Br_16 dg LGl_8 'lg dg Bl_8 	dbhg HG_4 'hg 				hdbe E_4 'e 
                    !	gg LAr_8 'la Bl_16 grp Cl_8 		dbe E_4 'e 					dbha HA_4 LA_8 
                    !	gg LAr_8 'la Fl_16 gg El_8 		thrd D_4 'd 					lgstd '1 D_4 _' '2 D_4 'd _' ''!I`;
    const ast: Score = parse(tune);

    expect(ast).toBeTruthy();
  });

  test('ties can have more that 2 notes in them', async function () {
    const tune = `& sharpf sharpc 2_4 I!'' gg ^ts Br_16 Cr_16 Dl_16 ^te ''!I`;
    const ast: Score = parse(tune);

    expect(ast).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: true,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '2', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '16',
                    pitch: 'B',
                    accidental: 'none',
                    tied: false,
                    fermata: false,
                    dot: 'none',
                    embellishment: {
                      type: 'gracenote',
                      value: {
                        note: 'g',
                      },
                    },
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '16',
                    pitch: 'C',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
                {
                  type: 'note',
                  value: {
                    length: '16',
                    pitch: 'D',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishment: {},
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('it can parse a gracenote without a note attached to it', async function () {
    const tune = `& sharpf sharpc  6_8 I! gg !I`;
    const ast: Score = parse(tune);

    expect(ast).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: true,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '6', bottom: '8' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'gracenote',
                  value: {
                    note: 'HG',
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });

  test('notes can have multiple embellishments', async function () {
    const tune = `& sharpf sharpc 2_4 I!'' eg strla E_4 ''!I`;
    const ast: Score = parse(tune);

    expect(ast).toStrictEqual({
      name: '',
      headers: [],
      staves: [
        {
          repeat: true,
          clef: {
            key: [
              { type: 'sharp', note: 'f' },
              { type: 'sharp', note: 'c' },
            ],
            time: { top: '2', bottom: '4' },
          },
          bars: [
            {
              notes: [
                {
                  type: 'note',
                  value: {
                    length: '16',
                    pitch: 'B',
                    accidental: 'none',
                    tied: true,
                    fermata: false,
                    dot: 'none',
                    embellishments: [
                      {
                        type: 'gracenote',
                        value: {
                          note: 'e',
                        },
                      },
                      {
                        type: 'strike',
                        value: {
                          note: 'la',
                        },
                      },
                    ],
                  },
                },
              ],
            },
          ],
        },
      ],
    });
  });
});
