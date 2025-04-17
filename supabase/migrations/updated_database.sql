-- Insert profiles data with board count and default board budget
INSERT INTO "public"."profiles" (
    "id",
    "full_name",
    "email_address",
    "mobile",
    "avatar_url",
    "has_notifications",
    "current_plan",
    "is_google_connected",
    "account_status",
    "created_at",
    "updated_at",
    "total_boards",
    "default_board_budget",
    "board_id",
    "referral_code"
) VALUES (
    '4841b1d3-60d8-4386-9718-e56c5dc44fd8',
    'Dhruv',
    'dhruv@yopmail.com',
    '7874766500',
    null,
    'false',
    'free',
    'false',
    'active',
    '2025-03-23 04:21:40.855711+00',
    '2025-03-23 04:21:40.855711+00',
    3,  -- Total number of boards for this user
    0.00,  -- Default board budget
    '25b2cd3b-9883-4a20-9606-0d81ace5389d',  -- Default board ID
    '1234567890'  -- Referral code
);

-- Insert categories data (both default and user-specific)
-- Note: User-specific categories will use the same IDs as default categories
INSERT INTO "public"."categories" ("id", "name", "description", "icon", "color", "is_default", "user_id", "created_at", "updated_at") VALUES
-- Default categories (user_id is null)
('09264e2c-6a00-47dc-a257-dacd2a60703a', 'Education', 'Education and learning', 'book', '#D4A5A5', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('618d34a3-597d-41c4-96b8-336240d04074', 'Food', 'Food and dining expenses', 'food', '#FF6B6B', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('0d70e61f-a64a-4a34-8122-10ab43ee764d', 'Entertainment', 'Entertainment and leisure', 'movie', '#96CEB4', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('66ff6918-a497-4c0b-8f0e-f57652be7322', 'Travel', 'Travel and tourism', 'airplane', '#3498DB', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('bf9b9b02-d77c-45ed-b524-d9184b0327b6', 'Transport', 'Transportation costs', 'car', '#4ECDC4', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('cf12df90-f7c2-4407-a3f4-951e87443990', 'Shopping', 'Shopping and retail', 'shopping', '#45B7D1', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('7622a19a-53a7-406d-b223-eb581adab67f', 'Health', 'Health and medical expenses', 'heart', '#FFEEAD', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
('ebe9fe8e-cd00-4ad7-9377-c37a2018c56b', 'Housing', 'Housing and utilities', 'home', '#9B59B6', 'true', null, '2025-03-23 04:20:36.680139+00', '2025-03-23 04:20:36.680139+00'),
-- User-specific categories (using same IDs as default categories)
('09264e2c-6a00-47dc-a257-dacd2a60703a', 'Education', 'Education and learning', 'book', '#D4A5A5', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
('0d70e61f-a64a-4a34-8122-10ab43ee764d', 'Entertainment', 'Entertainment and leisure', 'movie', '#96CEB4', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
('618d34a3-597d-41c4-96b8-336240d04074', 'Food', 'Food and dining expenses', 'food', '#FF6B6B', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
('66ff6918-a497-4c0b-8f0e-f57652be7322', 'Travel', 'Travel and tourism', 'airplane', '#3498DB', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
('7622a19a-53a7-406d-b223-eb581adab67f', 'Health', 'Health and medical expenses', 'heart', '#FFEEAD', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
('bf9b9b02-d77c-45ed-b524-d9184b0327b6', 'Transport', 'Transportation costs', 'car', '#4ECDC4', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
('cf12df90-f7c2-4407-a3f4-951e87443990', 'Shopping', 'Shopping and retail', 'shopping', '#45B7D1', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
('ebe9fe8e-cd00-4ad7-9377-c37a2018c56b', 'Housing', 'Housing and utilities', 'home', '#9B59B6', 'true', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00'),
-- Custom categories (with unique IDs)
('e558e68b-10f7-4a91-8442-9c2931024916', 'New', '', 'heart', '#4ECDC4', 'false', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 03:43:44.456019+00', '2025-03-28 03:43:44.456019+00'),
('08b2ee79-1278-48ea-9d1d-5975c5ba4f89', 'Travelq', 'Travel and tourism', 'airplane', '#3498DB', 'false', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 03:44:18.527115+00', '2025-03-28 03:44:18.527115+00');

-- Insert expense boards data (with is_default flag)
INSERT INTO "public"."expense_boards" (
    "id",
    "name",
    "description",
    "total_budget",
    "created_by",
    "created_at",
    "updated_at",
    "board_color",
    "board_icon",
    "per_person_budget",
    "share_code",
    "is_default"
) VALUES
('25b2cd3b-9883-4a20-9606-0d81ace5389d', 'General Expenses', 'Default board for tracking general expenses', '0.00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-23 04:21:40.855711+00', '2025-03-23 04:21:40.855711+00', null, null, null, null, true),
('511af495-874d-497a-b136-7c4e1885dbf7', 'Dummy', 'hchc', '10.00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 08:02:19.442+00', '2025-03-28 08:02:19.475733+00', '#FF6B6B', 'home', null, '8B22LY', false),
('b7adaf81-bef5-476e-8da9-ff944bf5915e', 'GOA', 'cjch', '60000.00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 09:08:10.753+00', '2025-03-28 09:08:10.82255+00', '#FF6B6B', 'home', null, 'BKHL7L', false);

-- Insert expenses data (unchanged)
INSERT INTO "public"."expenses" ("id", "board_id", "category_id", "amount", "description", "date", "created_by", "created_at", "updated_at", "payment_method") VALUES
('2162c9c4-55c9-4c18-99a8-f867e353a10f', 'b7adaf81-bef5-476e-8da9-ff944bf5915e', '09264e2c-6a00-47dc-a257-dacd2a60703a', '200.00', 'dummy', '2025-03-29 06:42:14.526+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-29 06:43:17.739701+00', '2025-03-29 06:43:17.739701+00', '2'),
('3f7cf2ed-2c90-41e3-b3c7-dd57ee493b46', '25b2cd3b-9883-4a20-9606-0d81ace5389d', '09264e2c-6a00-47dc-a257-dacd2a60703a', '10.00', 'add', '2025-03-28 03:42:22.83+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 03:42:46.033643+00', '2025-03-28 03:42:46.033643+00', 'Net Banking'),
('5de3f80d-d52d-4e38-8153-9c94d7a0b619', '25b2cd3b-9883-4a20-9606-0d81ace5389d', '0d70e61f-a64a-4a34-8122-10ab43ee764d', '10.00', 'vhgg', '2025-03-28 08:02:24.053+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 08:02:32.195855+00', '2025-03-28 08:02:32.195855+00', 'UPI'),
('82944e6a-341e-412d-8fa0-faf32617329c', 'b7adaf81-bef5-476e-8da9-ff944bf5915e', '09264e2c-6a00-47dc-a257-dacd2a60703a', '200.00', 'hcc bc', '2025-03-28 12:15:41.405+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 12:18:38.383692+00', '2025-03-28 12:18:38.383692+00', 'Cash'),
('8dd6c564-e3c8-44ff-8148-42e8321e711f', 'b7adaf81-bef5-476e-8da9-ff944bf5915e', 'cf12df90-f7c2-4407-a3f4-951e87443990', '10.00', 'zudio', '2025-03-29 06:47:01.122+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-29 06:47:41.363855+00', '2025-03-29 06:47:41.363855+00', 'card'),
('9c30f1f6-44cf-4d21-80d4-c3df65683e74', '511af495-874d-497a-b136-7c4e1885dbf7', '618d34a3-597d-41c4-96b8-336240d04074', '100.00', 'food', '2025-03-28 08:08:31.624+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-28 08:08:52.752078+00', '2025-03-28 08:08:52.752078+00', 'Card'),
('e472a0ef-94cb-478f-9f23-3bbfa707cc87', '25b2cd3b-9883-4a20-9606-0d81ace5389d', '09264e2c-6a00-47dc-a257-dacd2a60703a', '10.00', 'dgc', '2025-03-26 08:45:26.891+00', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', '2025-03-26 08:46:15.165012+00', '2025-03-26 08:46:15.165012+00', 'Card');

-- Insert notifications data (unchanged)
INSERT INTO "public"."notifications" ("id", "user_id", "type", "title", "message", "trip_name", "read", "icon", "icon_color", "created_at", "updated_at") VALUES
('478ac854-d2d1-4ba1-a248-a637df99099a', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'trip', 'Trip Reminder From App', 'Your trip to Paris starts in 3 days', 'Paris Vacation', 'false', 'airplane', '#9C27B0', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:45:37.695428+00'),
('5b41b6ea-9489-41c3-b765-c9e24432d885', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'budget', 'Budget Alert', 'You're approaching your budget limit', 'Business Trip', 'false', 'alert-circle', '#FFC107', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:36:40.52376+00'),
('81eb09d5-94d3-49c0-a27d-480894eb01cd', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'expense', 'New Expense Added', 'John added a new expense of $50 for dinner', 'Summer Vacation 2024', 'true', 'cash-plus', '#4CAF50', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:39:15.717202+00'),
('d884e138-a0b5-4417-86b7-50d1600a4676', '4841b1d3-60d8-4386-9718-e56c5dc44fd8', 'settlement', 'Payment Settlement', 'Alice needs to pay John $150', 'Weekend Trip', 'false', 'cash-transfer', '#2196F3', '2025-03-28 10:36:40.52376+00', '2025-03-28 10:36:40.52376+00');
