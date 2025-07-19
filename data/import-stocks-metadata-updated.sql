-- Import stocks metadata into Supabase with updated logos from Finnhub API
-- Make sure the tables are created first

-- Clear existing data (optional - remove if you want to keep existing data)
-- TRUNCATE TABLE stocks_metadata CASCADE;

-- Insert metadata for all stocks with real logos from Finnhub
INSERT INTO stocks_metadata (ticker, company_name, description, country, exchange, website, logo_url, sector, currency) VALUES
-- Argentina stocks (BCBA) - Real logos from Finnhub where available
('YPFD', 'YPF S.A.', 'YPF es la principal empresa de energía de Argentina, dedicada a la exploración, producción, refinación y comercialización de petróleo y gas.', 'Argentina', 'BCBA', 'https://www.ypf.com', '', 'Energía', 'ARS'),
('GGAL', 'Grupo Financiero Galicia S.A.', 'Banco Galicia es uno de los principales bancos privados de Argentina, ofreciendo servicios financieros integrales.', 'Argentina', 'BCBA', 'https://www.gfgsa.com/es', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GGAL3.BA.png', 'Financiero', 'ARS'),
('PAMP', 'Pampa Energía S.A.', 'Pampa Energía es la empresa de generación eléctrica más grande de Argentina, con participación en transmisión y distribución.', 'Argentina', 'BCBA', 'https://www.pampaenergia.com', '', 'Energía', 'ARS'),
('BMA', 'Banco Macro S.A.', 'Banco Macro es uno de los bancos privados líderes en Argentina, con fuerte presencia en el interior del país.', 'Argentina', 'BCBA', 'https://www.macro.com.ar/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BMA3.BA.png', 'Financiero', 'ARS'),
('LOMA', 'Loma Negra C.I.A.S.A.', 'Loma Negra es el principal productor de cemento de Argentina, con operaciones en todo el país.', 'Argentina', 'BCBA', 'https://www.lomanegra.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/LOMA3.BA.png', 'Materiales', 'ARS'),
('TXAR', 'Ternium Argentina S.A.', 'Ternium Argentina es una empresa siderúrgica líder en la producción de acero en América Latina.', 'Argentina', 'BCBA', 'https://www.ternium.com.ar', '', 'Materiales', 'ARS'),
('ALUA', 'Aluar Aluminio Argentino S.A.I.C.', 'Aluar es el único productor de aluminio primario en Argentina y uno de los principales en Sudamérica.', 'Argentina', 'BCBA', 'https://www.aluar.com.ar', '', 'Materiales', 'ARS'),
('CEPU', 'Central Puerto S.A.', 'Central Puerto es una de las principales empresas de generación de energía eléctrica de Argentina.', 'Argentina', 'BCBA', 'https://www.centralpuerto.com/es/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/CEPU3.BA.png', 'Energía', 'ARS'),
('BYMA', 'Bolsas y Mercados Argentinos S.A.', 'BYMA es el operador de los mercados de valores de Argentina, incluyendo la Bolsa de Comercio de Buenos Aires.', 'Argentina', 'BCBA', 'https://www.byma.com.ar', '', 'Financiero', 'ARS'),
('SUPV', 'Grupo Supervielle S.A.', 'Grupo Supervielle es un grupo financiero argentino con operaciones en banca, seguros y gestión de activos.', 'Argentina', 'BCBA', 'https://www.gruposupervielle.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/SUPV3.BA.png', 'Financiero', 'ARS'),
('TRAN', 'Transportadora de Gas del Norte S.A.', 'TGN es una de las principales transportadoras de gas natural de Argentina, operando gasoductos en el norte del país.', 'Argentina', 'BCBA', 'https://www.tgn.com.ar', '', 'Energía', 'ARS'),
('HARG', 'Holcim Argentina S.A.', 'Holcim Argentina es una empresa líder en la producción de cemento y hormigón elaborado.', 'Argentina', 'BCBA', 'https://www.holcim.com.ar', '', 'Materiales', 'ARS'),
('EDN', 'Edenor S.A.', 'Edenor es la mayor distribuidora de electricidad de Argentina, sirviendo al área norte y noroeste del Gran Buenos Aires.', 'Argentina', 'BCBA', 'https://www.edenor.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/EDN3.BA.png', 'Servicios Públicos', 'ARS'),
('COME', 'Sociedad Comercial del Plata S.A.', 'Sociedad Comercial del Plata es un holding con inversiones en construcción, concesiones viales y entretenimiento.', 'Argentina', 'BCBA', 'https://www.comercialdelplata.com.ar', '', 'Industrial', 'ARS'),
('TGSU2', 'Transportadora de Gas del Sur S.A.', 'TGS es la transportadora de gas natural más grande de Argentina, operando el sistema de gasoductos más extenso de América Latina.', 'Argentina', 'BCBA', 'https://www.tgs.com.ar', '', 'Energía', 'ARS'),
('CRES', 'Cresud S.A.C.I.F. y A.', 'Cresud es una de las principales empresas agropecuarias de Argentina, con actividades agrícolas, ganaderas e inmobiliarias.', 'Argentina', 'BCBA', 'https://www.cresud.com.ar', '', 'Agropecuario', 'ARS'),
('MIRG', 'Mirgor S.A.C.I.F.I.A.', 'Mirgor es una empresa argentina dedicada a la fabricación de productos electrónicos, automotrices y climatización.', 'Argentina', 'BCBA', 'https://www.mirgor.com.ar', '', 'Tecnología', 'ARS'),
('CADO', 'Carlos Casado S.A.', 'Carlos Casado es una empresa con actividades en el sector inmobiliario y agropecuario.', 'Argentina', 'BCBA', '', '', 'Inmobiliario', 'ARS'),
('AGRO', 'Agrometal S.A.I.', 'Agrometal es una empresa argentina líder en la fabricación de maquinaria agrícola.', 'Argentina', 'BCBA', 'https://www.adecoagro.com/en', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AGRO.png', 'Industrial', 'ARS'),
('VALO', 'Grupo Financiero Valores S.A.', 'Grupo Financiero Valores es una empresa de servicios financieros especializada en banca de inversión y mercado de capitales.', 'Argentina', 'BCBA', 'https://www.gfv.com.ar', '', 'Financiero', 'ARS'),

-- US stocks with real logos from Finnhub API
('AAPL', 'Apple Inc.', 'Apple designs, manufactures, and markets smartphones, computers, tablets, wearables, and accessories worldwide.', 'United States', 'NASDAQ', 'https://www.apple.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AAPL.png', 'Technology', 'USD'),
('MSFT', 'Microsoft Corporation', 'Microsoft develops, licenses, and supports software, services, devices, and solutions worldwide.', 'United States', 'NASDAQ', 'https://www.microsoft.com/en-in/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MSFT.png', 'Technology', 'USD'),
('GOOGL', 'Alphabet Inc.', 'Alphabet is the parent company of Google, offering products and services in search, advertising, cloud computing, and more.', 'United States', 'NASDAQ', 'https://abc.xyz/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/GOOG.png', 'Technology', 'USD'),
('AMZN', 'Amazon.com Inc.', 'Amazon is an e-commerce and cloud computing company that offers a range of products and services worldwide.', 'United States', 'NASDAQ', 'https://www.amazon.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AMZN.png', 'Consumer Cyclical', 'USD'),
('NVDA', 'NVIDIA Corporation', 'NVIDIA designs and manufactures graphics processing units (GPUs) for gaming, professional visualization, data centers, and automotive markets.', 'United States', 'NASDAQ', 'https://www.nvidia.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NVDA.png', 'Technology', 'USD'),
('TSLA', 'Tesla Inc.', 'Tesla designs, develops, manufactures, and sells electric vehicles, energy storage systems, and solar panels.', 'United States', 'NASDAQ', 'https://www.tesla.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/TSLA.png', 'Consumer Cyclical', 'USD'),
('BRK-B', 'Berkshire Hathaway Inc.', 'Berkshire Hathaway is a multinational conglomerate holding company led by Warren Buffett.', 'United States', 'NYSE', 'https://www.berkshirehathaway.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BRK.B.png', 'Financial', 'USD'),
('V', 'Visa Inc.', 'Visa operates the world''s largest retail electronic payments network and manages global financial services.', 'United States', 'NYSE', 'https://usa.visa.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/V.png', 'Financial', 'USD'),
('JPM', 'JPMorgan Chase & Co.', 'JPMorgan Chase is one of the largest financial services firms in the United States.', 'United States', 'NYSE', 'https://www.jpmorganchase.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/JPM.png', 'Financial', 'USD'),
('JNJ', 'Johnson & Johnson', 'Johnson & Johnson develops, manufactures, and sells pharmaceutical products, medical devices, and consumer packaged goods.', 'United States', 'NYSE', 'https://www.jnj.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/JNJ.png', 'Healthcare', 'USD'),
('WMT', 'Walmart Inc.', 'Walmart operates retail stores, wholesale clubs, and e-commerce websites globally.', 'United States', 'NYSE', 'https://corporate.walmart.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/WMT.png', 'Consumer Defensive', 'USD'),
('PG', 'The Procter & Gamble Company', 'Procter & Gamble manufactures and sells branded consumer packaged goods worldwide.', 'United States', 'NYSE', 'https://us.pg.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PG.png', 'Consumer Defensive', 'USD'),
('MA', 'Mastercard Inc.', 'Mastercard is a technology company in the global payments industry that connects consumers, financial institutions, and businesses.', 'United States', 'NYSE', 'https://www.mastercard.us/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MA.png', 'Financial', 'USD'),
('UNH', 'UnitedHealth Group Inc.', 'UnitedHealth Group is a diversified health care company offering health care coverage and services.', 'United States', 'NYSE', 'https://www.unitedhealthgroup.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/UNH.png', 'Healthcare', 'USD'),
('HD', 'The Home Depot Inc.', 'The Home Depot is the largest home improvement retailer in the United States.', 'United States', 'NYSE', 'https://www.homedepot.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/HD.png', 'Consumer Cyclical', 'USD'),
('BAC', 'Bank of America Corporation', 'Bank of America is one of the world''s largest financial institutions, serving consumers, businesses, and institutional investors.', 'United States', 'NYSE', 'https://www.bankofamerica.com', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/BAC.png', 'Financial', 'USD'),
('META', 'Meta Platforms Inc.', 'Meta (formerly Facebook) builds technologies that help people connect, find communities, and grow businesses.', 'United States', 'NASDAQ', 'https://www.meta.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/FB.png', 'Technology', 'USD'),
('AVGO', 'Broadcom Inc.', 'Broadcom designs, develops, and supplies semiconductor and infrastructure software solutions.', 'United States', 'NASDAQ', 'https://www.broadcom.com', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/AVGO.png', 'Technology', 'USD'),
('XOM', 'Exxon Mobil Corporation', 'Exxon Mobil explores for and produces crude oil and natural gas worldwide.', 'United States', 'NYSE', 'https://corporate.exxonmobil.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/XOM.png', 'Energy', 'USD'),
('CVX', 'Chevron Corporation', 'Chevron is an integrated energy company with operations in oil, natural gas, and geothermal energy.', 'United States', 'NYSE', 'https://www.chevron.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/CVX.png', 'Energy', 'USD'),
('KO', 'The Coca-Cola Company', 'Coca-Cola manufactures, sells, and distributes nonalcoholic beverages worldwide.', 'United States', 'NYSE', 'https://www.coca-colacompany.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/KO.png', 'Consumer Defensive', 'USD'),
('PFE', 'Pfizer Inc.', 'Pfizer discovers, develops, manufactures, and sells biopharmaceutical products worldwide.', 'United States', 'NYSE', 'https://www.pfizer.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PFE.png', 'Healthcare', 'USD'),
('MRK', 'Merck & Co. Inc.', 'Merck is a global healthcare company that delivers innovative health solutions through prescription medicines, vaccines, and animal health products.', 'United States', 'NYSE', 'https://www.merck.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MRK.png', 'Healthcare', 'USD'),
('LLY', 'Eli Lilly and Company', 'Eli Lilly discovers, develops, manufactures, and sells pharmaceutical products worldwide.', 'United States', 'NYSE', 'https://www.lilly.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/LLY.png', 'Healthcare', 'USD'),
('PEP', 'PepsiCo Inc.', 'PepsiCo manufactures, markets, and sells beverages and convenient foods worldwide.', 'United States', 'NYSE', 'https://www.pepsico.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/PEP.png', 'Consumer Defensive', 'USD'),
('ADBE', 'Adobe Inc.', 'Adobe provides digital media and digital marketing solutions worldwide.', 'United States', 'NASDAQ', 'https://www.adobe.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ADBE.png', 'Technology', 'USD'),
('CSCO', 'Cisco Systems Inc.', 'Cisco designs, manufactures, and sells Internet Protocol based networking and communications products.', 'United States', 'NASDAQ', 'https://www.cisco.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/950800186156.png', 'Technology', 'USD'),
('DIS', 'The Walt Disney Company', 'Disney is a diversified entertainment company with operations in media networks, parks, studio entertainment, and consumer products.', 'United States', 'NYSE', 'https://thewaltdisneycompany.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/DIS.png', 'Communication Services', 'USD'),
('MCD', 'McDonald''s Corporation', 'McDonald''s operates and franchises restaurants offering various food products worldwide.', 'United States', 'NYSE', 'https://www.mcdonalds.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MCD.png', 'Consumer Cyclical', 'USD'),
('ABBV', 'AbbVie Inc.', 'AbbVie discovers, develops, manufactures, and sells pharmaceutical products worldwide.', 'United States', 'NYSE', 'https://www.abbvie.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ABBV.png', 'Healthcare', 'USD'),
('ACN', 'Accenture plc', 'Accenture provides consulting, technology, and outsourcing services worldwide.', 'Ireland', 'NYSE', 'https://www.accenture.com/ie-en/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/ACN.png', 'Technology', 'USD'),
('TMO', 'Thermo Fisher Scientific Inc.', 'Thermo Fisher Scientific provides analytical instruments, equipment, reagents and consumables, software, and services worldwide.', 'United States', 'NYSE', 'https://www.thermofisher.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/TMO.png', 'Healthcare', 'USD'),
('CRM', 'Salesforce Inc.', 'Salesforce provides customer relationship management technology that brings companies and customers together.', 'United States', 'NYSE', 'https://www.salesforce.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/CRM.png', 'Technology', 'USD'),
('NKE', 'Nike Inc.', 'Nike designs, develops, markets, and sells athletic footwear, apparel, equipment, and accessories worldwide.', 'United States', 'NYSE', 'https://about.nike.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NKE.png', 'Consumer Cyclical', 'USD'),
('WFC', 'Wells Fargo & Company', 'Wells Fargo provides banking, investment, mortgage, and consumer and commercial finance products and services.', 'United States', 'NYSE', 'https://www.wellsfargo.com', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/WFC.png', 'Financial', 'USD'),
('INTC', 'Intel Corporation', 'Intel designs, manufactures, and sells computer components and related products for business and consumer markets.', 'United States', 'NASDAQ', 'https://www.intel.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/INTC.png', 'Technology', 'USD'),
('QCOM', 'QUALCOMM Inc.', 'Qualcomm develops and commercializes foundational technologies for the wireless industry worldwide.', 'United States', 'NASDAQ', 'https://www.qualcomm.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/QCOM.png', 'Technology', 'USD'),
('NFLX', 'Netflix Inc.', 'Netflix provides entertainment services with TV series, documentaries, and feature films across various genres and languages.', 'United States', 'NASDAQ', 'https://www.netflix.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/NFLX.png', 'Communication Services', 'USD'),
('MDT', 'Medtronic plc', 'Medtronic develops, manufactures, and sells medical device technologies and services worldwide.', 'Ireland', 'NYSE', 'https://www.medtronic.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/MDT.png', 'Healthcare', 'USD'),
('COST', 'Costco Wholesale Corporation', 'Costco operates membership warehouses offering a variety of merchandise worldwide.', 'United States', 'NYSE', 'https://www.costco.com/', 'https://static2.finnhub.io/file/publicdatany/finnhubimage/stock_logo/COST.png', 'Consumer Defensive', 'USD'),

-- Stocks that were rate-limited (no logo available)
('BA', 'The Boeing Company', 'Boeing designs, develops, manufactures, sells, services, and supports commercial airplanes, defense products, and space systems.', 'United States', 'NYSE', 'https://www.boeing.com', '', 'Industrials', 'USD'),
('IBM', 'International Business Machines Corporation', 'IBM provides integrated solutions and services worldwide, including cloud, data and AI, and infrastructure.', 'United States', 'NYSE', 'https://www.ibm.com', '', 'Technology', 'USD'),
('CAT', 'Caterpillar Inc.', 'Caterpillar manufactures and sells construction and mining equipment, diesel and natural gas engines, industrial gas turbines, and diesel-electric locomotives.', 'United States', 'NYSE', 'https://www.caterpillar.com', '', 'Industrials', 'USD'),
('GS', 'The Goldman Sachs Group Inc.', 'Goldman Sachs provides investment banking, securities, and investment management services to corporations, governments, and individuals worldwide.', 'United States', 'NYSE', 'https://www.goldmansachs.com', '', 'Financial', 'USD'),
('RTX', 'RTX Corporation', 'RTX (formerly Raytheon Technologies) is an aerospace and defense company providing advanced systems and services.', 'United States', 'NYSE', 'https://www.rtx.com', '', 'Industrials', 'USD'),
('HON', 'Honeywell International Inc.', 'Honeywell operates as a diversified technology and manufacturing company worldwide.', 'United States', 'NYSE', 'https://www.honeywell.com', '', 'Industrials', 'USD'),
('AXP', 'American Express Company', 'American Express provides charge and credit payment card products and travel-related services worldwide.', 'United States', 'NYSE', 'https://www.americanexpress.com', '', 'Financial', 'USD'),
('ORCL', 'Oracle Corporation', 'Oracle provides database software, cloud solutions, and enterprise software products worldwide.', 'United States', 'NYSE', 'https://www.oracle.com', '', 'Technology', 'USD'),
('DE', 'Deere & Company', 'John Deere manufactures and distributes agriculture, construction, and forestry machinery worldwide.', 'United States', 'NYSE', 'https://www.deere.com', '', 'Industrials', 'USD'),
('BLK', 'BlackRock Inc.', 'BlackRock is the world''s largest asset management firm, providing investment and risk management services.', 'United States', 'NYSE', 'https://www.blackrock.com', '', 'Financial', 'USD')

ON CONFLICT (ticker) DO UPDATE SET
  company_name = EXCLUDED.company_name,
  description = EXCLUDED.description,
  country = EXCLUDED.country,
  exchange = EXCLUDED.exchange,
  website = EXCLUDED.website,
  logo_url = EXCLUDED.logo_url,
  sector = EXCLUDED.sector,
  currency = EXCLUDED.currency,
  updated_at = timezone('utc', now());

-- Verify the import and check logo availability
SELECT 
  exchange, 
  COUNT(*) as total_stocks,
  SUM(CASE WHEN logo_url != '' THEN 1 ELSE 0 END) as stocks_with_logos,
  ROUND(
    (SUM(CASE WHEN logo_url != '' THEN 1 ELSE 0 END) * 100.0 / COUNT(*)), 
    1
  ) as percentage_with_logos
FROM stocks_metadata 
GROUP BY exchange 
ORDER BY exchange;