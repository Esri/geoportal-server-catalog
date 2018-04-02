<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" version="1.0" xmlns:esri="http://www.esri.com/metadata/" xmlns:res="http://www.esri.com/metadata/res/">

<!-- An XSLT template for displaying metadata in ArcGIS. These XSLT templates display the official unit of measure name in conjunction with the unit of measure code.

     Copyright (c) 2009-2010, Environmental Systems Research Institute, Inc. All rights reserved.
	
     Revision History: Created 6/15/2009 avienneau
-->

	<xsl:output method="xml" indent="yes"/>
	<xsl:template name="ucum_units">
		<xsl:param name="unit"/>
		<!-- SMR 2014-11-23, add for strtolcase function replacement
		based on http://stackoverflow.com/questions/586231/how-can-i-convert-a-string-to-upper-or-lower-case-with-xslt -->
		<xsl:variable name="smallcase" select="'abcdefghijklmnopqrstuvwxyz'" />
		<xsl:variable name="uppercase" select="'ABCDEFGHIJKLMNOPQRSTUVWXYZ'" />
		<xsl:variable name="lcunit">
			<xsl:value-of select="translate($unit, $smallcase, $uppercase)" />
		</xsl:variable>
		<xsl:choose>
			<xsl:when test="($unit = 'Ym')"><xsl:value-of select="$unit"/> (Yotta)</xsl:when>
			<xsl:when test="($unit = 'Zm')"><xsl:value-of select="$unit"/> (Zetta)</xsl:when>
			<xsl:when test="($unit = 'Em')"><xsl:value-of select="$unit"/> (dExa>)</xsl:when>
			<xsl:when test="($unit = 'Pm')"><xsl:value-of select="$unit"/> (Peta)</xsl:when>
			<xsl:when test="($unit = 'Tm')"><xsl:value-of select="$unit"/> (Tera)</xsl:when>
			<xsl:when test="($unit = 'Gm')"><xsl:value-of select="$unit"/> (Giga)</xsl:when>
			<xsl:when test="($unit = 'Mm')"><xsl:value-of select="$unit"/> (Mega)</xsl:when>
			<xsl:when test="($unit = 'km')"><xsl:value-of select="$unit"/> (Kilo)</xsl:when>
			<xsl:when test="($unit = 'hm')"><xsl:value-of select="$unit"/> (Hecto)</xsl:when>
			<xsl:when test="($unit = 'dam')"><xsl:value-of select="$unit"/> (Deka)</xsl:when>
			<xsl:when test="($unit = 'dm')"><xsl:value-of select="$unit"/> (Deci)</xsl:when>
			<xsl:when test="($unit = 'cm')"><xsl:value-of select="$unit"/> (Centi)</xsl:when>
			<xsl:when test="($unit = 'mm')"><xsl:value-of select="$unit"/> (Milli)</xsl:when>
			<xsl:when test="($unit = 'um')"><xsl:value-of select="$unit"/> (Micro)</xsl:when>
			<xsl:when test="($unit = 'nn')"><xsl:value-of select="$unit"/> (Nano)</xsl:when>
			<xsl:when test="($unit = 'pm')"><xsl:value-of select="$unit"/> (Pico)</xsl:when>
			<xsl:when test="($unit = 'fm')"><xsl:value-of select="$unit"/> (Femto)</xsl:when>
			<xsl:when test="($unit = 'am')"><xsl:value-of select="$unit"/> (Atto)</xsl:when>
			<xsl:when test="($unit = 'zm')"><xsl:value-of select="$unit"/> (Zepto)</xsl:when>
			<xsl:when test="($unit = 'ym')"><xsl:value-of select="$unit"/> (Yocto)</xsl:when>
			<xsl:when test="($lcunit = 'm')"><xsl:value-of select="$unit"/> (Meter)</xsl:when>
			<xsl:when test="($lcunit = 's')"><xsl:value-of select="$unit"/> (Second)</xsl:when>
			<xsl:when test="($lcunit = 'g')"><xsl:value-of select="$unit"/> (Gram)</xsl:when>
			<xsl:when test="($lcunit = 'rad')"><xsl:value-of select="$unit"/> (Radian)</xsl:when>
			<xsl:when test="($lcunit = 'k')"><xsl:value-of select="$unit"/> (Kelvin)</xsl:when>
			<xsl:when test="($lcunit = 'c')"><xsl:value-of select="$unit"/> (Coulomb)</xsl:when>
			<xsl:when test="($lcunit = 'cd')"><xsl:value-of select="$unit"/> (Candela)</xsl:when>
			<xsl:when test="($unit = '10*')"><xsl:value-of select="$unit"/> (TenArbPowsStar)</xsl:when>
			<xsl:when test="($unit = '10^')"><xsl:value-of select="$unit"/> (TenArbPowsCarat)</xsl:when>
			<xsl:when test="($lcunit = '[pi]')"><xsl:value-of select="$unit"/> (Pi)</xsl:when>
			<xsl:when test="($unit = '%')"><xsl:value-of select="$unit"/> (Percent)</xsl:when>
			<xsl:when test="($lcunit = '[ppth]')"><xsl:value-of select="$unit"/> (PPTh)</xsl:when>
			<xsl:when test="($lcunit = '[ppm]')"><xsl:value-of select="$unit"/> (PPM)</xsl:when>
			<xsl:when test="($lcunit = '[ppb]')"><xsl:value-of select="$unit"/> (PPB)</xsl:when>
			<xsl:when test="($lcunit = '[pptr]')"><xsl:value-of select="$unit"/> (PPTr)</xsl:when>
			<xsl:when test="($lcunit = 'mol')"><xsl:value-of select="$unit"/> (Mole)</xsl:when>
			<xsl:when test="($lcunit = 'sr')"><xsl:value-of select="$unit"/> (Steradian)</xsl:when>
			<xsl:when test="($lcunit = 'hz')"><xsl:value-of select="$unit"/> (Hertz)</xsl:when>
			<xsl:when test="($lcunit = 'n')"><xsl:value-of select="$unit"/> (Newton)</xsl:when>
			<xsl:when test="($lcunit = 'pa') or ($lcunit = 'PAL')"><xsl:value-of select="$unit"/> (Pascal)</xsl:when>
			<xsl:when test="($lcunit = 'j')"><xsl:value-of select="$unit"/> (Joule)</xsl:when>
			<xsl:when test="($lcunit = 'w')"><xsl:value-of select="$unit"/> (Watt)</xsl:when>
			<xsl:when test="($lcunit = 'a')"><xsl:value-of select="$unit"/> (Amp)</xsl:when>
			<xsl:when test="($lcunit = 'v')"><xsl:value-of select="$unit"/> (Volt)</xsl:when>
			<xsl:when test="($lcunit = 'f')"><xsl:value-of select="$unit"/> (Farad)</xsl:when>
			<xsl:when test="($lcunit = 'ohm')"><xsl:value-of select="$unit"/> Ohm)</xsl:when>
			<xsl:when test="($lcunit = 's') or ($lcunit = 'sie')"><xsl:value-of select="$unit"/> (Siemens)</xsl:when>
			<xsl:when test="($lcunit = 'wb')"><xsl:value-of select="$unit"/> (Weber)</xsl:when>
			<xsl:when test="($lcunit = 'cel')"><xsl:value-of select="$unit"/> (DegCelsius)</xsl:when>
			<xsl:when test="($lcunit = 't')"><xsl:value-of select="$unit"/> (Tesla)</xsl:when>
			<xsl:when test="($lcunit = 'h')"><xsl:value-of select="$unit"/> (Henry)</xsl:when>
			<xsl:when test="($lcunit = 'lm')"><xsl:value-of select="$unit"/> (Lumen)</xsl:when>
			<xsl:when test="($lcunit = 'lx')"><xsl:value-of select="$unit"/> (Lux)</xsl:when>
			<xsl:when test="($lcunit = 'bq')"><xsl:value-of select="$unit"/> (Becquerel)</xsl:when>
			<xsl:when test="($lcunit = 'gy')"><xsl:value-of select="$unit"/> (Gray)</xsl:when>
			<xsl:when test="($lcunit = 'sv')"><xsl:value-of select="$unit"/> (Sievert)</xsl:when>
			<xsl:when test="($lcunit = 'gon')"><xsl:value-of select="$unit"/> (GonGrade)</xsl:when>
			<xsl:when test="($lcunit = 'deg')"><xsl:value-of select="$unit"/> (Degree)</xsl:when>
			<xsl:when test='($unit = "&apos;")'><xsl:value-of select="$unit"/> (Minute)</xsl:when>
			<xsl:when test="($unit = '&quot;')"><xsl:value-of select="$unit"/> (Second_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = 'l')"><xsl:value-of select="$unit"/> (Liter)</xsl:when>
			<xsl:when test="($lcunit = 'ar')"><xsl:value-of select="$unit"/> (Are)</xsl:when>
			<xsl:when test="($lcunit = 'min')"><xsl:value-of select="$unit"/> (Minute_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = 'h')"><xsl:value-of select="$unit"/> (Hour)</xsl:when>
			<xsl:when test="($lcunit = 'd')"><xsl:value-of select="$unit"/> (Day)</xsl:when>
			<xsl:when test="($lcunit = 'a_t') or ($lcunit = 'ann_t')"><xsl:value-of select="$unit"/> (TropicalYear)</xsl:when>
			<xsl:when test="($lcunit = 'a_j') or ($lcunit = 'ann_j')"><xsl:value-of select="$unit"/> (MeanJulianYear)</xsl:when>
			<xsl:when test="($lcunit = 'a_g') or ($lcunit = 'ann_g')"><xsl:value-of select="$unit"/> (MeanGregorianYear)</xsl:when>
			<xsl:when test="($lcunit = 'a') or ($lcunit = 'ann')"><xsl:value-of select="$unit"/> (Year)</xsl:when>
			<xsl:when test="($lcunit = 'wk')"><xsl:value-of select="$unit"/> (Week)</xsl:when>
			<xsl:when test="($lcunit = 'mo_s')"><xsl:value-of select="$unit"/> (SynodalMonth)</xsl:when>
			<xsl:when test="($lcunit = 'mo_j')"><xsl:value-of select="$unit"/> (MeanJulianMonth)</xsl:when>
			<xsl:when test="($lcunit = 'mo_g')"><xsl:value-of select="$unit"/> (MeanGregorianMonth)</xsl:when>
			<xsl:when test="($lcunit = 'mo')"><xsl:value-of select="$unit"/> (Month)</xsl:when>
			<xsl:when test="($lcunit = 't') or ($lcunit = 'tne')"><xsl:value-of select="$unit"/> (Tonne)</xsl:when>
			<xsl:when test="($lcunit = 'bar')"><xsl:value-of select="$unit"/> (Bar)</xsl:when>
			<xsl:when test="($lcunit = 'u') or ($lcunit = 'amu')"><xsl:value-of select="$unit"/> (AMU)</xsl:when>
			<xsl:when test="($lcunit = 'ev')"><xsl:value-of select="$unit"/> (EV)</xsl:when>
			<xsl:when test="($lcunit = 'au') or ($lcunit = 'asu')"><xsl:value-of select="$unit"/> (AU)</xsl:when>
			<xsl:when test="($lcunit = 'pc') or ($lcunit = 'prs')"><xsl:value-of select="$unit"/> (Parsec)</xsl:when>
			<xsl:when test="($lcunit = '[c]')"><xsl:value-of select="$unit"/> (VelocityOfLight)</xsl:when>
			<xsl:when test="($lcunit = '[h]')"><xsl:value-of select="$unit"/> (PlanckConstant)</xsl:when>
			<xsl:when test="($lcunit = '[k]')"><xsl:value-of select="$unit"/> (BoltzmannConstant)</xsl:when>
			<xsl:when test="($lcunit = '[eps_0]')"><xsl:value-of select="$unit"/> (PermittivityOfVacuum)</xsl:when>
			<xsl:when test="($lcunit = '[mu_0]')"><xsl:value-of select="$unit"/> (PermeabilityOfVacuum)</xsl:when>
			<xsl:when test="($lcunit = '[e]')"><xsl:value-of select="$unit"/> (ElementaryCharge)</xsl:when>
			<xsl:when test="($lcunit = '[m_e]')"><xsl:value-of select="$unit"/> (ElectronMass)</xsl:when>
			<xsl:when test="($lcunit = '[m_p]')"><xsl:value-of select="$unit"/> (ProtonMass)</xsl:when>
			<xsl:when test="($lcunit = '[g]') or ($lcunit = '[gc]')"><xsl:value-of select="$unit"/> (NewtonGravConstant)</xsl:when>
			<xsl:when test="($lcunit = '[g]')"><xsl:value-of select="$unit"/> (StdFreefallAccel)</xsl:when>
			<xsl:when test="($lcunit = 'atm')"><xsl:value-of select="$unit"/> (StdAtmo)</xsl:when>
			<xsl:when test="($lcunit = '[ly]')"><xsl:value-of select="$unit"/> (Lightyear)</xsl:when>
			<xsl:when test="($lcunit = 'gf')"><xsl:value-of select="$unit"/> (GramForce)</xsl:when>
			<xsl:when test="($lcunit = '[lbf_av]')"><xsl:value-of select="$unit"/> (PoundForce)</xsl:when>
			<xsl:when test="($lcunit = 'ky')"><xsl:value-of select="$unit"/> (Kayser)</xsl:when>
			<xsl:when test="($lcunit = 'gal') or ($lcunit = 'gl')"><xsl:value-of select="$unit"/> (Gal)</xsl:when>
			<xsl:when test="($lcunit = 'dyn')"><xsl:value-of select="$unit"/> (Dyne)</xsl:when>
			<xsl:when test="($lcunit = 'erg')"><xsl:value-of select="$unit"/> (Erg)</xsl:when>
			<xsl:when test="($lcunit = 'p')"><xsl:value-of select="$unit"/> (Poise)</xsl:when>
			<xsl:when test="($lcunit = 'bi')"><xsl:value-of select="$unit"/> (Biot)</xsl:when>
			<xsl:when test="($lcunit = 'st')"><xsl:value-of select="$unit"/> (Stokes)</xsl:when>
			<xsl:when test="($lcunit = 'mx')"><xsl:value-of select="$unit"/> (Maxwell)</xsl:when>
			<xsl:when test="($lcunit = 'g') or ($lcunit = 'gs')"><xsl:value-of select="$unit"/> (Gauss)</xsl:when>
			<xsl:when test="($lcunit = 'oe')"><xsl:value-of select="$unit"/> (Oersted)</xsl:when>
			<xsl:when test="($lcunit = 'gb')"><xsl:value-of select="$unit"/> (Gilbert)</xsl:when>
			<xsl:when test="($lcunit = 'sb')"><xsl:value-of select="$unit"/> (Stilb)</xsl:when>
			<xsl:when test="($lcunit = 'lmb')"><xsl:value-of select="$unit"/> (Lambert)</xsl:when>
			<xsl:when test="($lcunit = 'ph') or ($lcunit = 'pht')"><xsl:value-of select="$unit"/> (Phot)</xsl:when>
			<xsl:when test="($lcunit = 'ci')"><xsl:value-of select="$unit"/> (Curie)</xsl:when>
			<xsl:when test="($lcunit = 'r') or ($lcunit = 'roe')"><xsl:value-of select="$unit"/> (Roentgen)</xsl:when>
			<xsl:when test="($lcunit = 'rad') or ($lcunit = '[rad]')"><xsl:value-of select="$unit"/> (RadiationAbsorbedDose)</xsl:when>
			<xsl:when test="($lcunit = 'rem') or ($lcunit = '[rem]')"><xsl:value-of select="$unit"/> (RadiationEquivalentMan)</xsl:when>
			<xsl:when test="($lcunit = '[in_i]')"><xsl:value-of select="$unit"/> (Inch)</xsl:when>
			<xsl:when test="($lcunit = '[ft_i]')"><xsl:value-of select="$unit"/> (Foot)</xsl:when>
			<xsl:when test="($lcunit = '[yd_i]')"><xsl:value-of select="$unit"/> (Yard)</xsl:when>
			<xsl:when test="($lcunit = '[mi_i]')"><xsl:value-of select="$unit"/> (StatuteMile)</xsl:when>
			<xsl:when test="($lcunit = '[fth_i]')"><xsl:value-of select="$unit"/> (Fathom)</xsl:when>
			<xsl:when test="($lcunit = '[nmi_i]')"><xsl:value-of select="$unit"/> (NauticalMile)</xsl:when>
			<xsl:when test="($lcunit = '[kn_i]')"><xsl:value-of select="$unit"/> (Knot)</xsl:when>
			<xsl:when test="($lcunit = '[sin_i]')"><xsl:value-of select="$unit"/> (SquareInch)</xsl:when>
			<xsl:when test="($lcunit = '[sft_i]')"><xsl:value-of select="$unit"/> (SquareFoot)</xsl:when>
			<xsl:when test="($lcunit = '[syd_i]')"><xsl:value-of select="$unit"/> (SquareYard)</xsl:when>
			<xsl:when test="($lcunit = '[cin_i]')"><xsl:value-of select="$unit"/> (CubicInch)</xsl:when>
			<xsl:when test="($lcunit = '[cft_i]')"><xsl:value-of select="$unit"/> (CubicFoot)</xsl:when>
			<xsl:when test="($lcunit = '[cyd_i]')"><xsl:value-of select="$unit"/> (CubicYard)</xsl:when>
			<xsl:when test="($lcunit = '[bf_i]')"><xsl:value-of select="$unit"/> (BoardFoot)</xsl:when>
			<xsl:when test="($lcunit = '[cr_i]')"><xsl:value-of select="$unit"/> (Cord)</xsl:when>
			<xsl:when test="($lcunit = '[mil_i]')"><xsl:value-of select="$unit"/> (Mil)</xsl:when>
			<xsl:when test="($lcunit = '[cml_i]')"><xsl:value-of select="$unit"/> (CircularMil)</xsl:when>
			<xsl:when test="($lcunit = '[hd_i]')"><xsl:value-of select="$unit"/> (Hand)</xsl:when>
			<xsl:when test="($lcunit = '[ft_us]')"><xsl:value-of select="$unit"/> (Foot_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[yd_us]')"><xsl:value-of select="$unit"/> (Yard_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[in_us]')"><xsl:value-of select="$unit"/> (Inch_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[rd_us]')"><xsl:value-of select="$unit"/> (Rod)</xsl:when>
			<xsl:when test="($lcunit = '[ch_us]')"><xsl:value-of select="$unit"/> (GunterSurveyorChain)</xsl:when>
			<xsl:when test="($lcunit = '[lk_us]')"><xsl:value-of select="$unit"/> (GunterChainLink)</xsl:when>
			<xsl:when test="($lcunit = '[rch_us]')"><xsl:value-of select="$unit"/> (RamdenEngineerChain)</xsl:when>
			<xsl:when test="($lcunit = '[rlk_us]')"><xsl:value-of select="$unit"/> (RamdenChainLink)</xsl:when>
			<xsl:when test="($lcunit = '[fth_us]')"><xsl:value-of select="$unit"/> (Fathom_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[fur_us]')"><xsl:value-of select="$unit"/> (Furlong)</xsl:when>
			<xsl:when test="($lcunit = '[mi_us]')"><xsl:value-of select="$unit"/> Mile)</xsl:when>
			<xsl:when test="($lcunit = '[acr_us]')"><xsl:value-of select="$unit"/> (Acre)</xsl:when>
			<xsl:when test="($lcunit = '[srd_us]')"><xsl:value-of select="$unit"/> (SquareRod)</xsl:when>
			<xsl:when test="($lcunit = '[smi_us]')"><xsl:value-of select="$unit"/> (SquareMile)</xsl:when>
			<xsl:when test="($lcunit = '[sct]')"><xsl:value-of select="$unit"/> (Section)</xsl:when>
			<xsl:when test="($lcunit = '[twp]')"><xsl:value-of select="$unit"/> (Township)</xsl:when>
			<xsl:when test="($lcunit = '[mil_us]')"><xsl:value-of select="$unit"/> (Mil_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[in_br]')"><xsl:value-of select="$unit"/> (Inch_auxUCUM_0)</xsl:when>
			<xsl:when test="($lcunit = '[ft_br]')"><xsl:value-of select="$unit"/> (Foot_auxUCUM_0)</xsl:when>
			<xsl:when test="($lcunit = '[rd_br]')"><xsl:value-of select="$unit"/> (Rod_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[ch_br]')"><xsl:value-of select="$unit"/> (GunterChain)</xsl:when>
			<xsl:when test="($lcunit = '[lk_br]')"><xsl:value-of select="$unit"/> (GunterChainLink_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[fth_br]')"><xsl:value-of select="$unit"/> (Fathom_auxUCUM_0)</xsl:when>
			<xsl:when test="($lcunit = '[pc_br]')"><xsl:value-of select="$unit"/> (Pace)</xsl:when>
			<xsl:when test="($lcunit = '[yd_br]')"><xsl:value-of select="$unit"/> (Yard_auxUCUM_0)</xsl:when>
			<xsl:when test="($lcunit = '[mi_br]')"><xsl:value-of select="$unit"/> (Mile_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[nmi_br]')"><xsl:value-of select="$unit"/> (NauticalMile_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[kn_br]')"><xsl:value-of select="$unit"/> (Knot_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[acr_br]')"><xsl:value-of select="$unit"/> (Acre_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[gal_us]')"><xsl:value-of select="$unit"/> (QueenAnneWineGallon)</xsl:when>
			<xsl:when test="($lcunit = '[bbl_us]')"><xsl:value-of select="$unit"/> (Barrel)</xsl:when>
			<xsl:when test="($lcunit = '[qt_us]')"><xsl:value-of select="$unit"/> (Quart)</xsl:when>
			<xsl:when test="($lcunit = '[pt_us]')"><xsl:value-of select="$unit"/> (Pint)</xsl:when>
			<xsl:when test="($lcunit = '[gil_us]')"><xsl:value-of select="$unit"/> (Gill)</xsl:when>
			<xsl:when test="($lcunit = '[foz_us]')"><xsl:value-of select="$unit"/> (FluidOunce)</xsl:when>
			<xsl:when test="($lcunit = '[fdr_us]')"><xsl:value-of select="$unit"/> (FluidDram)</xsl:when>
			<xsl:when test="($lcunit = '[min_us]')"><xsl:value-of select="$unit"/> (Minim)</xsl:when>
			<xsl:when test="($lcunit = '[crd_us]')"><xsl:value-of select="$unit"/> (Cord_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[bu_us]')"><xsl:value-of select="$unit"/> (Bushel)</xsl:when>
			<xsl:when test="($lcunit = '[gal_wi]')"><xsl:value-of select="$unit"/> (HistWinchesterGallon)</xsl:when>
			<xsl:when test="($lcunit = '[pk_us]')"><xsl:value-of select="$unit"/> (Peck)</xsl:when>
			<xsl:when test="($lcunit = '[dqt_us]')"><xsl:value-of select="$unit"/> (DryQuart)</xsl:when>
			<xsl:when test="($lcunit = '[dpt_us]')"><xsl:value-of select="$unit"/> (DryPint)</xsl:when>
			<xsl:when test="($lcunit = '[tbs_us]')"><xsl:value-of select="$unit"/> (Tablespoon)</xsl:when>
			<xsl:when test="($lcunit = '[tsp_us]')"><xsl:value-of select="$unit"/> (Teaspoon)</xsl:when>
			<xsl:when test="($lcunit = '[cup_us]')"><xsl:value-of select="$unit"/> (Cup)</xsl:when>
			<xsl:when test="($lcunit = '[gal_br]')"><xsl:value-of select="$unit"/> (Gallon)</xsl:when>
			<xsl:when test="($lcunit = '[pk_br]')"><xsl:value-of select="$unit"/> (Peck_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[bu_br]')"><xsl:value-of select="$unit"/> (Bushel_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[qt_br]')"><xsl:value-of select="$unit"/> (Quart_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[pt_br]')"><xsl:value-of select="$unit"/> (Pint_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[gil_br]')"><xsl:value-of select="$unit"/> (Gill_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[foz_br]')"><xsl:value-of select="$unit"/> (FluidOunce_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[fdr_br]')"><xsl:value-of select="$unit"/> (FluidDram_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[min_br]')"><xsl:value-of select="$unit"/> (Minim_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[gr]')"><xsl:value-of select="$unit"/> (Grain)</xsl:when>
			<xsl:when test="($lcunit = '[lb_av]')"><xsl:value-of select="$unit"/> (Pound)</xsl:when>
			<xsl:when test="($lcunit = '[oz_av]')"><xsl:value-of select="$unit"/> (Ounce)</xsl:when>
			<xsl:when test="($lcunit = '[dr_av]')"><xsl:value-of select="$unit"/> (Dram)</xsl:when>
			<xsl:when test="($lcunit = '[scwt_av]')"><xsl:value-of select="$unit"/> (ShortUSHundredweight)</xsl:when>
			<xsl:when test="($lcunit = '[lcwt_av]')"><xsl:value-of select="$unit"/> (LongBritishHundredweight)</xsl:when>
			<xsl:when test="($lcunit = '[ston_av]')"><xsl:value-of select="$unit"/> (ShortUSTon)</xsl:when>
			<xsl:when test="($lcunit = '[lton_av]')"><xsl:value-of select="$unit"/> (LongBritishTon)</xsl:when>
			<xsl:when test="($lcunit = '[stone_av]') "><xsl:value-of select="$unit"/> (BritishStone)</xsl:when>
			<xsl:when test="($lcunit = '[pwt_tr]')"><xsl:value-of select="$unit"/> (Pennyweight)</xsl:when>
			<xsl:when test="($lcunit = '[oz_tr]')"><xsl:value-of select="$unit"/> (Ounce_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[lb_tr]')"><xsl:value-of select="$unit"/> (Pound_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[sc_ap]')"><xsl:value-of select="$unit"/> (Scruple)</xsl:when>
			<xsl:when test="($lcunit = '[dr_ap]')"><xsl:value-of select="$unit"/> (DramDrachm)</xsl:when>
			<xsl:when test="($lcunit = '[oz_ap]')"><xsl:value-of select="$unit"/> (Ounce_auxUCUM_0)</xsl:when>
			<xsl:when test="($lcunit = '[lb_ap]')"><xsl:value-of select="$unit"/> (Pound_auxUCUM_0)</xsl:when>
			<xsl:when test="($lcunit = '[lne]')"><xsl:value-of select="$unit"/> (Line)</xsl:when>
			<xsl:when test="($lcunit = '[pnt]')"><xsl:value-of select="$unit"/> (Point_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = '[pca]')"><xsl:value-of select="$unit"/> (Pica)</xsl:when>
			<xsl:when test="($lcunit = '[pnt_pr]')"><xsl:value-of select="$unit"/> (PrinterPoint)</xsl:when>
			<xsl:when test="($lcunit = '[pca_pr]')"><xsl:value-of select="$unit"/> (PrinterPica/>))</xsl:when>
			<xsl:when test="($lcunit = '[pied]')"><xsl:value-of select="$unit"/> (PiedFrenchFoot)</xsl:when>
			<xsl:when test="($lcunit = '[pouce]')"><xsl:value-of select="$unit"/> (PouceFrenchInch)</xsl:when>
			<xsl:when test="($lcunit = '[ligne]')"><xsl:value-of select="$unit"/> (LigneFrenchLine)</xsl:when>
			<xsl:when test="($lcunit = '[didot]')"><xsl:value-of select="$unit"/> (DidotPoint)</xsl:when>
			<xsl:when test="($lcunit = '[cicero]')"><xsl:value-of select="$unit"/> (CiceroDidotPica)</xsl:when>
			<xsl:when test="($lcunit = '[degf]')"><xsl:value-of select="$unit"/> (DegreeFahrenheit)</xsl:when>
			<xsl:when test="($lcunit = 'cal_[15]')"><xsl:value-of select="$unit"/> (CalorieAt15C)</xsl:when>
			<xsl:when test="($lcunit = 'cal_[20]')"><xsl:value-of select="$unit"/> (CalorieAt20C)</xsl:when>
			<xsl:when test="($lcunit = 'cal_m')"><xsl:value-of select="$unit"/> (MeanCalorie)</xsl:when>
			<xsl:when test="($lcunit = 'cal_it')"><xsl:value-of select="$unit"/> (IntlTableCalorie)</xsl:when>
			<xsl:when test="($lcunit = 'cal_th')"><xsl:value-of select="$unit"/> (ThermochemCalorie)</xsl:when>
			<xsl:when test="($lcunit = 'cal')"><xsl:value-of select="$unit"/> (Calorie)</xsl:when>
			<xsl:when test="($lcunit = '[cal]')"><xsl:value-of select="$unit"/> (NutritionLabelCalories)</xsl:when>
			<xsl:when test="($lcunit = '[btu_39]')"><xsl:value-of select="$unit"/> (BTUAt39F)</xsl:when>
			<xsl:when test="($lcunit = '[btu_59]')"><xsl:value-of select="$unit"/> (BTUAt59F)</xsl:when>
			<xsl:when test="($lcunit = '[btu_60]')"><xsl:value-of select="$unit"/> (BTUAt60F)</xsl:when>
			<xsl:when test="($lcunit = '[btu_m]')"><xsl:value-of select="$unit"/> (MeanBTU)</xsl:when>
			<xsl:when test="($lcunit = '[btu_IT]')"><xsl:value-of select="$unit"/> (IntlTableBTU)</xsl:when>
			<xsl:when test="($lcunit = '[btu_th]')"><xsl:value-of select="$unit"/> (ThermochemBTU)</xsl:when>
			<xsl:when test="($lcunit = '[btu]')"><xsl:value-of select="$unit"/> (BTU)</xsl:when>
			<xsl:when test="($lcunit = '[hp]')"><xsl:value-of select="$unit"/> (Horsepower)</xsl:when>
			<xsl:when test="($lcunit = 'm[h2o]')"><xsl:value-of select="$unit"/> (MeterOfWaterColumn)</xsl:when>
			<xsl:when test="($lcunit = 'm[hg]')"><xsl:value-of select="$unit"/> (MeterOfMercuryColumn)</xsl:when>
			<xsl:when test='($lcunit = "[in_i&apos;h2o]")'><xsl:value-of select="$unit"/> (InchOfWaterColumn)</xsl:when>
			<xsl:when test='($lcunit = "[in_i&apos;hg]")'><xsl:value-of select="$unit"/> (InchOfMercuryColumn)</xsl:when>
			<xsl:when test="($lcunit = '[pru]')"><xsl:value-of select="$unit"/> (PeripheralVascularResistanceUnit)</xsl:when>
			<xsl:when test="($lcunit = '[diop]')"><xsl:value-of select="$unit"/> (Diopter)</xsl:when>
			<xsl:when test='($lcunit = "[p&apos;diop]")'><xsl:value-of select="$unit"/> (PrismDiopter)</xsl:when>
			<xsl:when test="($lcunit = '%[slope]')"><xsl:value-of select="$unit"/> (PercentOfSlope)</xsl:when>
			<xsl:when test="($lcunit = '[mesh_i]')"><xsl:value-of select="$unit"/> (Mesh)</xsl:when>
			<xsl:when test="($lcunit = '[ch]')"><xsl:value-of select="$unit"/> (CharriereFrench)</xsl:when>
			<xsl:when test="($lcunit = '[drp]')"><xsl:value-of select="$unit"/> (Drop)</xsl:when>
			<xsl:when test='($lcunit = "[hnsf&apos;u]")'><xsl:value-of select="$unit"/> (HounsfieldUnit)</xsl:when>
			<xsl:when test="($lcunit = '[met]')"><xsl:value-of select="$unit"/> (MetabolicEquivalent)</xsl:when>
			<xsl:when test="($lcunit = '[hp_x]')"><xsl:value-of select="$unit"/> (HomeopathicPotencyOfDecimalSeries)</xsl:when>
			<xsl:when test="($lcunit = '[hp_c]')"><xsl:value-of select="$unit"/> (HomeopathicPotencyOfCentesimalSeries)</xsl:when>
			<xsl:when test="($lcunit = 'eq')"><xsl:value-of select="$unit"/> (Equivalents)</xsl:when>
			<xsl:when test="($lcunit = 'osm')"><xsl:value-of select="$unit"/> (Osmole)</xsl:when>
			<xsl:when test="($lcunit = '[ph]')"><xsl:value-of select="$unit"/> (Ph)</xsl:when>
			<xsl:when test="($lcunit = 'g%')"><xsl:value-of select="$unit"/> (GramPercent)</xsl:when>
			<xsl:when test="($lcunit = '[s]')"><xsl:value-of select="$unit"/> (SvedbergUnit)</xsl:when>
			<xsl:when test="($lcunit = '[hpf]')"><xsl:value-of select="$unit"/> (HighPowerField)</xsl:when>
			<xsl:when test="($lcunit = '[lpf]')"><xsl:value-of select="$unit"/> (LowPowerField)</xsl:when>
			<xsl:when test="($lcunit = 'kat')"><xsl:value-of select="$unit"/> (Katal)</xsl:when>
			<xsl:when test="($lcunit = 'u')"><xsl:value-of select="$unit"/> (Unit)</xsl:when>
			<xsl:when test="($lcunit = '[iu]')"><xsl:value-of select="$unit"/> (IntlUnit)</xsl:when>
			<xsl:when test='($lcunit = "[arb&apos;u]")'><xsl:value-of select="$unit"/> (ArbitaryUnit)</xsl:when>
			<xsl:when test='($lcunit = "[usp&apos;u]")'><xsl:value-of select="$unit"/> (UnitedStatesPharmacopeiaUnit)</xsl:when>
			<xsl:when test='($lcunit = "[gpl&apos;u]")'><xsl:value-of select="$unit"/> (GPLUnit)</xsl:when>
			<xsl:when test='($lcunit = "[mpl&apos;u]")'><xsl:value-of select="$unit"/> (MPLUnit)</xsl:when>
			<xsl:when test='($lcunit = "[apl&apos;u]")'><xsl:value-of select="$unit"/> (APLUnit)</xsl:when>
			<xsl:when test='($lcunit = "[beth&apos;u]")'><xsl:value-of select="$unit"/> (BethesdaUnit)</xsl:when>
			<xsl:when test='($lcunit = "[todd&apos;u]")'><xsl:value-of select="$unit"/> (ToddUnit)</xsl:when>
			<xsl:when test='($lcunit = "[dye&apos;u]")'><xsl:value-of select="$unit"/> (DyeUnit)</xsl:when>
			<xsl:when test='($lcunit = "[smgy&apos;u]")'><xsl:value-of select="$unit"/> (SomogyiUnit)</xsl:when>
			<xsl:when test='($lcunit = "[bdsk&apos;u]")'><xsl:value-of select="$unit"/> (BodanskyUnit)</xsl:when>
			<xsl:when test='($lcunit = "[ka&apos;u]")'><xsl:value-of select="$unit"/> (KingArmstrongUnit)</xsl:when>
			<xsl:when test='($lcunit = "[knk&apos;u]")'><xsl:value-of select="$unit"/> (KunkelUnit)</xsl:when>
			<xsl:when test='($lcunit = "[mclg&apos;u]")'><xsl:value-of select="$unit"/> (MacLaganUnit)</xsl:when>
			<xsl:when test='($lcunit = "[tb&apos;u]")'><xsl:value-of select="$unit"/> (TuberculinUnit)</xsl:when>
			<xsl:when test="($lcunit = '[ccid_50]')"><xsl:value-of select="$unit"/> (50PctCellCultureInfectiousDose)</xsl:when>
			<xsl:when test="($lcunit = '[tcid_50]')"><xsl:value-of select="$unit"/> (50PctTissueCultureInfectiousDose)</xsl:when>
			<xsl:when test="($lcunit = '[pfu]')"><xsl:value-of select="$unit"/> (PlaqueFormingUnits)</xsl:when>
			<xsl:when test="($lcunit = '[ffu]')"><xsl:value-of select="$unit"/> (ImmunofocusFormingUnits)</xsl:when>
			<xsl:when test="($lcunit = '[cfu]')"><xsl:value-of select="$unit"/> (ColonyFormingUnits)</xsl:when>
			<xsl:when test="($lcunit = 'np') or ($lcunit = 'nep')"><xsl:value-of select="$unit"/> (Neper)</xsl:when>
			<xsl:when test="($lcunit = 'b')"><xsl:value-of select="$unit"/> (Bel)</xsl:when>
			<xsl:when test="($lcunit = 'b[spl]')"><xsl:value-of select="$unit"/> (BelSoundPressure)</xsl:when>
			<xsl:when test="($lcunit = 'b[v]')"><xsl:value-of select="$unit"/> (BelVolt)</xsl:when>
			<xsl:when test="($lcunit = 'b[mv]')"><xsl:value-of select="$unit"/> (BelMillivolt)</xsl:when>
			<xsl:when test="($lcunit = 'b[uv]')"><xsl:value-of select="$unit"/> (BelMicrovolt)</xsl:when>
			<xsl:when test="($lcunit = 'b[w]')"><xsl:value-of select="$unit"/> (BelWatt)</xsl:when>
			<xsl:when test="($lcunit = 'b[kw]')"><xsl:value-of select="$unit"/> (BelKilowatt)</xsl:when>
			<xsl:when test="($lcunit = 'st') or ($lcunit = 'str')"><xsl:value-of select="$unit"/> (Stere)</xsl:when>
			<xsl:when test="($lcunit = 'ao')"><xsl:value-of select="$unit"/> (Angstrom)</xsl:when>
			<xsl:when test="($lcunit = 'b') or ($lcunit = 'brn')"><xsl:value-of select="$unit"/> (Barn)</xsl:when>
			<xsl:when test="($lcunit = 'att')"><xsl:value-of select="$unit"/> (TechAtmo)</xsl:when>
			<xsl:when test="($lcunit = 'mho')"><xsl:value-of select="$unit"/> (Mho)</xsl:when>
			<xsl:when test="($lcunit = '[psi]')"><xsl:value-of select="$unit"/> (PoundPerSqareInch)</xsl:when>
			<xsl:when test="($lcunit = 'circ')"><xsl:value-of select="$unit"/> (Circle)</xsl:when>
			<xsl:when test="($lcunit = 'sph')"><xsl:value-of select="$unit"/> (Spere)</xsl:when>
			<xsl:when test="($lcunit = '[car_m]')"><xsl:value-of select="$unit"/> (MetricCarat)</xsl:when>
			<xsl:when test="($lcunit = '[car_au]')"><xsl:value-of select="$unit"/> (CaratOfGoldAlloys)</xsl:when>
			<xsl:when test="($lcunit = '[smoot]')"><xsl:value-of select="$unit"/> (Smoot)</xsl:when>
			<xsl:when test="($lcunit = 'bit_s')"><xsl:value-of select="$unit"/> (Bit)</xsl:when>
			<xsl:when test="($lcunit = 'bit')"><xsl:value-of select="$unit"/> (Bit_auxUCUM)</xsl:when>
			<xsl:when test="($lcunit = 'by')"><xsl:value-of select="$unit"/> (Byte)</xsl:when>
			<xsl:when test="($lcunit = 'bd')"><xsl:value-of select="$unit"/> (Baud)</xsl:when>
			<xsl:when test="($lcunit = 'ki') or ($lcunit = 'kib')"><xsl:value-of select="$unit"/> (Kibi)</xsl:when>
			<xsl:when test="($lcunit = 'mi') or ($lcunit = 'mib')"><xsl:value-of select="$unit"/> (Mebi)</xsl:when>
			<xsl:when test="($lcunit = 'gi') or ($lcunit = 'gib')"><xsl:value-of select="$unit"/> (Gibi)</xsl:when>
			<xsl:when test="($lcunit = 'ti') or ($lcunit = 'tib')"><xsl:value-of select="$unit"/> (Tebi)</xsl:when>
			<xsl:otherwise>
				<xsl:value-of select="."/>
			</xsl:otherwise>
		</xsl:choose>
	</xsl:template>
</xsl:stylesheet>