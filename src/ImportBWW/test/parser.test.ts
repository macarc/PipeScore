import { readFileSync } from 'fs';
import { parse } from '../Parser';
import { parsesWithoutWarnings } from './test_common';

describe('correctly parses score body', () => {
  test('it works without any headers', () =>
    expect(parsesWithoutWarnings('& sharpf sharpc 3_4')).toBe(true));

  test('it can parse common time signature', () =>
    expect(parsesWithoutWarnings('& sharpf sharpc C')).toBe(true));

  test('it can parse cut time signature', () =>
    expect(parsesWithoutWarnings('& sharpf sharpc C_')).toBe(true));

  test('it can parse a single bar', () =>
    expect(
      parsesWithoutWarnings('& sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 !I')
    ).toBe(true));

  test('it can parse a multiple bars', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 ! LA_4 B_4 C_4 D_4 !I'
      )
    ).toBe(true));

  test('it can parse a multiple lines', () =>
    expect(
      parsesWithoutWarnings(`
            & sharpf sharpc 4_4 I! LA_4 !I
            & sharpf sharpc  I! LA_4 !I
            `)
    ).toBe(true));

  test('it can parse left and right beam directions', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LAr_8 Bl_8 Cr_8 Dl_8 Er_8 Fl_8 HGr_8 HAl_8 !I'
      )
    ).toBe(true));

  test('it can parse gracenotes', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 strlg LA_4 gstb B_4 tstc C_4 hstd D_4 lhstd D_4 ltstd D_4 lgstd D_4 !I'
      )
    ).toBe(true));

  test('it can parse doublings', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! dbla LA_4 hdbb B_4 tdbc C_4 dbd D_4 !I'
      )
    ).toBe(true));

  test('it can parse strikes', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! dbla LA_4 hdbb B_4 tdbc C_4 dbd D_4 !I'
      )
    ).toBe(true));

  test('it can parse grips', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 grp E_4 LG_4 hgrp E_4 D_4 grpb E_4 D_4 grpb LA_4 E_4 ggrpb B_4 D_4 ggrpdb E_4 tgrpd D_4 tgrpdb D_4 hgrpdb D_4 hgrpb B_4 !I'
      )
    ).toBe(true));

  test('it can parse taorluaths', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! C_4 tar LA_4 D_4 tarb LA_4 !I'
      )
    ).toBe(true));

  test('it can parse bubbly notes', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! C_4 bubly B_4 LG_4 hbubly B_4 !I'
      )
    ).toBe(true));

  test('it can parse birls', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 brl LA_4 HA_4 abr LA_4 E_4 gbr LA_4 HG_4 tbr LA_4 !I'
      )
    ).toBe(true));

  test('it can parse throws', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 thrd D_4 LA_4 hvthrd D_4 LG_4 hthrd D_4 LG_4 hhvthrd D_4 !I'
      )
    ).toBe(true));

  test('it can parse peles', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! E_4 pella LA_4 lpeld D_4 tpeld D_4 ltpeld D_4 hpeld D_4 lhpeld D_4 !I'
      )
    ).toBe(true));

  test('it can parse double strikes', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 st2la LA_4 lst2d D_4 gst2d D_4 lgst2d D_4 tst2d D_4 ltst2d D_4 hst2d D_4 lhst2d D_4 !I'
      )
    ).toBe(true));

  test('it can parse triple strikes', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 st3la LA_4 lst3d D_4 gst3d D_4 lgst3d D_4 tst3d D_4 ltst3d D_4 hst3d D_4 lhst3d D_4 !I'
      )
    ).toBe(true));

  test('it can parse double gracenotes', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! dlg LA_4 gla B_4 tb C_4 thg HA_4 !I'
      )
    ).toBe(true));

  test('it can parse singly dotted notes', () =>
    expect(
      parsesWithoutWarnings(
        "& sharpf sharpc 4_4 I! gg LA_4 tar LAr_8 'la Bl_16 !I"
      )
    ).toBe(true));

  test('it can parse doubly dotted notes', () =>
    expect(
      parsesWithoutWarnings(
        "& sharpf sharpc 4_4 I! gg LA_4 tar LAr_8 ''la Bl_16 !I"
      )
    ).toBe(true));

  test('it can parse an anacrusis', () =>
    expect(
      parsesWithoutWarnings(
        "& sharpf sharpc 4_4 E_8 ! gg LA_4 tar LAr_8 'la Bl_16 dbc Cr_8 eg LAl_8 dbc Cr_8 El_8 !I"
      )
    ).toBe(true));

  test('it can parse a repeated part', () =>
    expect(
      parsesWithoutWarnings("& sharpf sharpc 4_4 I!'' LA_4 B_4 C_4 D_4 ''!I")
    ).toBe(true));

  test('it can parse a rest', () =>
    expect(
      parsesWithoutWarnings('& sharpf sharpc 4_4 I! LA_4 B_4 REST_4 D_4 !I')
    ).toBe(true));

  test('it can parse accidentals before notes', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 sharpb B_4 flatc C_4 naturald D_4 !I'
      )
    ).toBe(true));

  test('it can parse fermatas', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 B_4 C_4 D_4 fermatd !I'
      )
    ).toBe(true));

  test('it can parse the old tie format', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! LA_4 ^tla LA_4 B_4 C_4 ^tc ! C_4 D_2 ^td D_4 !I'
      )
    ).toBe(true));

  test('it can parse the new tie format', () =>
    expect(
      parsesWithoutWarnings(
        '& sharpf sharpc 4_4 I! ^ts LA_4 LA_4 ^te B_4 ^ts C_4 ! C_4 ^te ^ts D_2 D_4 ^te !I'
      )
    ).toBe(true));

  test("ties can begin before a note's embellishment", () =>
    expect(
      parsesWithoutWarnings(`& sharpf sharpc 4_4 gg Br_8 LAl_8 dblg LG_4 'lg gg LG_8 ^ts dbhg HG_4
                        ! HGr_8 ^te Fl_8 	eg Fr_8 ^ts El_8 E_2
                        ! Er_8 ^te gg El_8 thrd D_4 'd dbb B_8 ag B_4
                        ! dblg LG_4 gg LA_2 'la
                        !I`)
    ).toBe(true));

  test('it can parse the new triplet format', () =>
    expect(
      parsesWithoutWarnings('& sharpf sharpc 2_4 I! gg ^3s C_8 E_8 LA_8 ^3e !I')
    ).toBe(true));

  test('it can parse the old triplet format', () =>
    expect(
      parsesWithoutWarnings('& sharpf sharpc 2_4 I! LA_4 E_8 C_8 LA_8 ^3e !I')
    ).toBe(true));
  /*
  test('it can parse an irregular note group', () =>
    check("& sharpf sharpc 6_8
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
                            !I"));
                            */

  test('it can parse time lines', () =>
    expect(
      parsesWithoutWarnings(
        "& sharpf sharpc 2_4 I! LA_4 B_4 ! '1 C_4 B_4 _' ! '2 C_4 D_4 _' ! 'intro HA_4 E_4 _' !I"
      )
    ).toBe(true));

  test('it can parse scotland the brave', async () => {
    const path = 'src/ImportBWW/test/fixtures/Scotland_the_Brave.bww';
    const file = await readFileSync(path, {}).toString('utf-8');
    const { warnings } = parse(file);

    expect(warnings.length).toBe(0);
  });

  test('a tune can have a gracenote before a tied note', () =>
    expect(
      parsesWithoutWarnings(
        "& sharpf sharpc 4_4 I!'' gg LGr_16 LAl_16 Br_16 gg ^ts Dl_16		Dr_16 ^te Bl_16 gg Er_16 Dl_16 ''!I"
      )
    ).toBe(true));

  test('there can be multiple time lines on the same line', () =>
    expect(
      parsesWithoutWarnings(`& sharpf sharpc 9_8
                        Fr_16 gg Dl_8 'd HAl_8 			hdbf F_4 'f 					thrd D_4 C_8 
                    !	gg Br_16 dg LGl_8 'lg dg Bl_8 	dbhg HG_4 'hg 				hdbe E_4 'e 
                    !	gg LAr_8 'la Bl_16 grp Cl_8 		dbe E_4 'e 					dbha HA_4 LA_8 
                    !	gg LAr_8 'la Fl_16 gg El_8 		thrd D_4 'd 					lgstd '1 D_4 _' '2 D_4 'd _' ''!I`)
    ).toBe(true));

  test('ties can have more that 2 notes in them', () =>
    expect(
      parsesWithoutWarnings(
        "& sharpf sharpc 2_4 I!'' gg ^ts Br_16 Cr_16 Dl_16 ^te ''!I"
      )
    ).toBe(true));

  test('it can parse a gracenote without a note attached to it', () =>
    expect(parsesWithoutWarnings('& sharpf sharpc  6_8 I! gg !I')).toBe(true));

  test('notes can have multiple embellishments', () =>
    expect(
      parsesWithoutWarnings("& sharpf sharpc 2_4 I!'' eg strla E_4 ''!I")
    ).toBe(true));
});
