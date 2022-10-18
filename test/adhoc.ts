import Parser from "../src/Parser";
import util from "util";

const parser: Parser = new Parser();
const ast: object = parser.parse(
    `& sharpf sharpc 4_4
		E_8
!		gg LA_4			tar LAr_8 'la Bl_16		dbc Cr_8 eg LAl_8	dbc Cr_8 El_8
!		dbha HA_4		strhg HA_4			grp HAr_8 El_8	dbc Cr_8 eg LAl_8
!		thrd D_4			gg Fr_8 'f Dl_16		dbc Cr_8 El_8		dbc Cr_8 eg LAl_8
!		grp B_4			dbe E_4				strla Er_8 'e Fl_16	gg Er_16 'e Dl_32 gg Cr_16 'c Bl_32	!t

& sharpf sharpc
		gg LA_4			tar LAr_8 'la Bl_16		dbc Cr_8 eg LAl_8	dbc Cr_8 El_8
!		dbha HA_4		strhg HA_4			grp HAr_8 El_8	dbc Cr_8 eg LAl_8
!		thrd D_4			gg Fr_8 'f Dl_16		dbc Cr_8 El_8		dbc Cr_8 eg LAl_8
!		grp B_4			gg LAr_8 'la Bl_16		strlg LA_4		dbc Cr_8 El_8				!I

& sharpf sharpc
		dbha HA_4		strhg HA_4			grp HAr_8 El_8	dbc Cr_8 eg LAl_8
!		dbha HA_4		strhg HA_4			grp HAr_8 El_8	dbc Cr_8 El_8
!		dbha HA_4		strhg HAr_8 'ha HGl_16	tg F_4			dbha HAr_8 'ha HGl_16
!		tg Fr_8 HAl_8		strf HGr_8 Fl_8		dbe Er_8 Dl_8		dbc Cr_8 Bl_8				!t

& sharpf sharpc
		gg LA_4			tar LAr_8 'la Bl_16		dbc Cr_8 eg LAl_8	dbc Cr_8 El_8
!		dbha HA_4		strhg HA_4			grp HAr_8 El_8	dbc Cr_8 eg LAl_8
!		thrd D_4			gg Fr_8 'f Dl_16		dbc Cr_8 El_8		dbc Cr_8 eg LAl_8
!		grp B_4			gg LAr_8 'la Bl_16		strlg LA_4 'la								!I`
);

console.log(
    util.inspect(ast, { showHidden: false, depth: null, colors: true })
);
