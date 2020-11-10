with recursive
    neighbors(id, source, target) as (
        select id, query_video_file_id as source, match_video_file_id as target
        from matches
        where query_video_file_id = 26 or query_video_file_id = 26
        union
            select cur.id as id, cur.query_video_file_id as source, cur.match_video_file_id as target
            from neighbors prev
            inner join matches cur on
                cur.query_video_file_id = prev.source or
                cur.query_video_file_id = prev.target or
                cur.match_video_file_id = prev.source or
                cur.match_video_file_id = prev.target
    ),
    stepwise_neighbors(id, source, target, step) as (
        select id, source, target, 1
        from neighbors
        where source = :id or target = :id
        union all
            cur.id, cur.source, cur.target, cur.step + 1


    )
select * from neighbors limit 26;